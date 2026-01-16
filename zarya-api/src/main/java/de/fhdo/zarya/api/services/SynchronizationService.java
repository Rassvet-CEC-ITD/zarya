package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.repositories.*;
import de.fhdo.zarya.api.interfaces.services.IContractReadService;
import de.fhdo.zarya.api.interfaces.services.IPartyOrganDecoderService;
import de.fhdo.zarya.api.persistance.models.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.generated.*;
import org.web3j.abi.datatypes.*;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("rawtypes")
@Slf4j
@Service
public class SynchronizationService {
    private final OrganRepository organRepository;
    private final ThemeRepository themeRepository;
    private final StatementRepository statementRepository;
    private final NumericalCellRepository numericalCellRepository;
    private final CategoricalCellRepository categoricalCellRepository;
    private final IContractReadService contractReadService;
    private final IPartyOrganDecoderService partyOrganDecoderService;

    @Value("${zarya.scan.cells.size}")
    private int maxScanSize;

    public SynchronizationService(OrganRepository organRepository,
                                  ThemeRepository themeRepository,
                                  StatementRepository statementRepository,
                                  NumericalCellRepository numericalCellRepository,
                                  CategoricalCellRepository categoricalCellRepository,
                                  IContractReadService contractReadService,
                                  IPartyOrganDecoderService partyOrganDecoderService) {
        this.organRepository = organRepository;
        this.themeRepository = themeRepository;
        this.statementRepository = statementRepository;
        this.numericalCellRepository = numericalCellRepository;
        this.contractReadService = contractReadService;
        this.partyOrganDecoderService = partyOrganDecoderService;
        this.categoricalCellRepository = categoricalCellRepository;
    }

    @Scheduled(fixedRate = 12 * 3600 * 1000)
    public void sync() {
        log.info("Synchronizing data from blockchain");
        try {
            syncThemesAndStatements(maxScanSize, maxScanSize);
            syncAllCells();
            log.info("Synchronization completed successfully");
        } catch (Exception e) {
            log.error("Error during synchronization", e);
        }
    }

    private void syncThemesAndStatements(int maxX, int maxY) throws Exception {
        log.info("Syncing themes and statements");
        for (boolean isCategorical : new boolean[]{true, false}) {
            for (int x = 0; x < maxX; x++) {
                syncTheme(isCategorical, x);
            }
            for (int y = 0; y < maxY; y++) {
                syncStatement(isCategorical, y);
            }
        }
    }

    private void syncTheme(boolean isCategorical, int x) throws Exception {
        String text = callStringFunction("getTheme", new Bool(isCategorical), new Uint256(x));
        if (text == null || text.isEmpty()) return;
        Theme theme = themeRepository.findByXIndexAndIsCategorical((long) x, isCategorical).orElse(new Theme());
        theme.setText(text);
        theme.setCategorical(isCategorical);
        theme.setXIndex((long) x);
        themeRepository.save(theme);
    }

    private void syncStatement(boolean isCategorical, int y) throws Exception {
        String text = callStringFunction("getStatement", new Bool(isCategorical), new Uint256(y));
        if (text == null || text.isEmpty()) return;
        Statement statement = statementRepository.findByYIndexAndIsCategorical((long) y, isCategorical)
                .orElse(new Statement());
        statement.setText(text);
        statement.setCategorical(isCategorical);
        statement.setYIndex((long) y);
        statementRepository.save(statement);
    }

    private String callStringFunction(String functionName, Type<?>... params) throws Exception {
        List<Type> result = contractReadService.callFunction(functionName,
                Arrays.asList(params), 
                List.of(new TypeReference<Utf8String>() {}));
        return result.isEmpty() ? null : (String) result.getFirst().getValue();
    }

    private void syncAllCells() throws Exception {
        log.info("Syncing cells");
        for (Theme theme : themeRepository.findAll()) {
            for (Statement statement : statementRepository.findAll()) {
                // Only sync cells where theme and statement have matching isCategorical values
                if (theme.isCategorical() == statement.isCategorical()) {
                    if (theme.isCategorical()) {
                        syncCategoricalCell(theme.getXIndex().intValue(), statement.getYIndex().intValue());
                    } else {
                        syncNumericalCell(theme.getXIndex().intValue(), statement.getYIndex().intValue());
                    }
                }
            }
        }
    }

    private void syncNumericalCell(int x, int y) throws Exception {
        List<Type> info = contractReadService.callFunction("getNumericalCellInfo", List.of(new Uint256(x), new Uint256(y)),
                List.of(new TypeReference<Bytes32>() {},
                        new TypeReference<Uint8>() {},
                        new TypeReference<Uint256>() {}));

        BigInteger sampleLength = (BigInteger) info.get(2).getValue();
        if (sampleLength.compareTo(BigInteger.ZERO) == 0) return;

        List<Type> history = contractReadService.callFunction("getNumericalHistory",
                List.of(new Uint256(x), new Uint256(y), new Uint256(0), new Uint256(sampleLength)),
                List.of(new TypeReference<DynamicArray<Uint32>>() {},
                        new TypeReference<DynamicArray<Address>>() {},
                        new TypeReference<DynamicArray<Uint64>>() {}));

        @SuppressWarnings("unchecked")
        List<Double> doubleValues = ((List<Uint64>) history.get(2).getValue()).stream()
                .map(v -> convertToDouble(v.getValue(), ((BigInteger) info.get(1).getValue()).intValue()))
                .collect(Collectors.toList());

        NumericalCell cell = numericalCellRepository.findById(new NumericalCell.NumericalCellId(x, y)).orElse(new NumericalCell());
        cell.setXIndex(x);
        cell.setYIndex(y);
        cell.setValue(doubleValues);
        cell.setOrgan(getOrCreateOrgan((byte[]) info.getFirst().getValue()));
        numericalCellRepository.save(cell);
    }

    private void syncCategoricalCell(int x, int y) throws Exception {
        List<Type> info = contractReadService.callFunction("getCategoricalCellInfo", List.of(new Uint256(x), new Uint256(y)),
                List.of(new TypeReference<Bytes32>() {},
                        new TypeReference<DynamicArray<Uint64>>() {},
                        new TypeReference<Uint256>() {}));

        BigInteger sampleLength = (BigInteger) info.get(2).getValue();
        if (sampleLength.compareTo(BigInteger.ZERO) == 0) {
            return;
        }

        // Get allowed categories from info (second element)
        @SuppressWarnings("unchecked")
        List<String> allowedCategoryNames = ((List<Uint64>) info.get(1).getValue()).stream()
                .map(v -> getCategoryName(x, y, v.getValue()))
                .collect(Collectors.toList());

        // Get actual category history
        List<Type> history = contractReadService.callFunction("getCategoricalHistory",
                List.of(new Uint256(x), new Uint256(y), new Uint256(0), new Uint256(sampleLength)),
                List.of(new TypeReference<DynamicArray<Uint32>>() {},
                        new TypeReference<DynamicArray<Address>>() {},
                        new TypeReference<DynamicArray<Uint64>>() {}));

        @SuppressWarnings("unchecked")
        List<String> categoryNames = ((List<Uint64>) history.get(2).getValue()).stream()
                .map(v -> getCategoryName(x, y, v.getValue()))
                .collect(Collectors.toList());
        log.info("Fetched categorical cell at x={}, y={} with categories: {}", x, y, categoryNames);

        CategoricalCell cell = categoricalCellRepository.findById(new CategoricalCell.CategoricalCellId(x, y)).orElse(new CategoricalCell());
        cell.setXIndex(x);
        cell.setYIndex(y);
        cell.setCategory(categoryNames);
        cell.setAllowedCategory(allowedCategoryNames);
        cell.setOrgan(getOrCreateOrgan((byte[]) info.getFirst().getValue()));
        categoricalCellRepository.save(cell);
    }

    private String getCategoryName(int x, int y, BigInteger categoryId) {
        try {
            return callStringFunction("getCategoryName", new Uint256(x), new Uint256(y),
                    new Uint64(categoryId.longValue()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to get category name for x=" + x + ", y=" + y + ", categoryId=" + categoryId, e);
        }
    }

    private Organ getOrCreateOrgan(byte[] organBytes) {
        long organId = Arrays.hashCode(organBytes);
        return organRepository.findById(organId).orElseGet(() -> {
            Organ organ = new Organ();
            organ.setId(organId);
            organ.setName(partyOrganDecoderService.decodeOrganHash(organBytes));
            return organRepository.save(organ);
        });
    }

    private double convertToDouble(BigInteger value, int decimals) {
        return new BigDecimal(value).divide(BigDecimal.TEN.pow(decimals), decimals, RoundingMode.HALF_DOWN).doubleValue();
    }
}
