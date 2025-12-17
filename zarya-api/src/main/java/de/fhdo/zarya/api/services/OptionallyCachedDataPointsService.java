package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.dto.CellSampleElement;
import de.fhdo.zarya.api.dto.CellSampleElementValue;
import de.fhdo.zarya.api.dto.DataPoint;
import de.fhdo.zarya.api.interfaces.repositories.*;
import de.fhdo.zarya.api.interfaces.services.IContractReadService;
import de.fhdo.zarya.api.interfaces.services.IDataPointsService;
import de.fhdo.zarya.api.persistance.models.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class OptionallyCachedDataPointsService implements IDataPointsService {

    @Value("${zarya.cache.enabled:true}")
    private boolean cacheEnabled;

    @Value("${zarya.contract.address}")
    private String contractAddress;

    @Value("${zarya.contract.decimals}")
    private byte defaultDecimals;

    private final IContractReadService contractReadService;
    private final NumericalCellCRUDRepository numericalCellRepository;
    private final CategoricalCellCRUDRepository categoricalCellRepository;
    private final ThemeCRUDRepository themeRepository;
    private final StatementCRUDRepository statementRepository;
    private final OrganCRUDRepository organRepository;

    @Autowired
    public OptionallyCachedDataPointsService(
            IContractReadService contractReadService,
            NumericalCellCRUDRepository numericalCellRepository,
            CategoricalCellCRUDRepository categoricalCellRepository,
            ThemeCRUDRepository themeRepository,
            StatementCRUDRepository statementRepository,
            OrganCRUDRepository organRepository) {
        this.contractReadService = contractReadService;
        this.numericalCellRepository = numericalCellRepository;
        this.categoricalCellRepository = categoricalCellRepository;
        this.themeRepository = themeRepository;
        this.statementRepository = statementRepository;
        this.organRepository = organRepository;
    }

    @Override
    public List<DataPoint> getAllDataPoints() throws Exception {
        if (cacheEnabled && hasCache()) {
            log.debug("Loading data points from cache");
            return loadFromCache();
        }

        log.debug("Loading data points from blockchain");
        List<DataPoint> dataPoints = loadFromBlockchain();

        if (cacheEnabled) {
            saveToCache(dataPoints);
        }

        return dataPoints;
    }

    @Override
    public DataPoint getDataPoint(int xIndex, int yIndex) throws Exception {
        if (cacheEnabled) {
            Optional<DataPoint> cached = loadFromCache(xIndex, yIndex);
            if (cached.isPresent()) {
                return cached.get();
            }
        }

        return loadFromBlockchain(xIndex, yIndex);
    }

    @Override
    public void refreshCache() throws Exception {
        log.info("Refreshing cache from blockchain");
        List<DataPoint> dataPoints = loadFromBlockchain();
        clearCache();
        saveToCache(dataPoints);
    }

    private boolean hasCache() {
        return numericalCellRepository.count() > 0 || categoricalCellRepository.count() > 0;
    }

    private List<DataPoint> loadFromCache() {
        List<DataPoint> dataPoints = new ArrayList<>();

        // Load numerical cells
        numericalCellRepository.findAll().forEach(cell -> {
            CellSampleElementValue value = new CellSampleElementValue(
                    BigInteger.valueOf(cell.getValue().getFirst().longValue()),
                    Optional.empty(),
                    Optional.of((byte) 2)
            );
            CellSampleElement element = new CellSampleElement(
                    0,
                    cell.getOrgan().getName(),
                    value
            );
            dataPoints.add(new DataPoint(
                    cell.getTheme().getText(),
                    cell.getStatement().getText(),
                    element
            ));
        });

        // Load categorical cells
        categoricalCellRepository.findAll().forEach(cell -> {
            String[] categories = cell.getCategory().stream()
                    .map(Category::getName)
                    .toArray(String[]::new);
            CellSampleElementValue value = new CellSampleElementValue(
                    BigInteger.ZERO,
                    Optional.of(categories),
                    Optional.empty()
            );
            CellSampleElement element = new CellSampleElement(
                    0,
                    cell.getOrgan().getName(),
                    value
            );
            dataPoints.add(new DataPoint(
                    cell.getTheme().getText(),
                    cell.getStatement().getText(),
                    element
            ));
        });

        return dataPoints;
    }

    private Optional<DataPoint> loadFromCache(int xIndex, int yIndex) {
        // Try numerical cell first
        Optional<NumericalCell> numericalCell = numericalCellRepository.findById(
                new NumericalCell.NumericalCellId(xIndex, yIndex)
        );

        if (numericalCell.isPresent()) {
            NumericalCell cell = numericalCell.get();
            CellSampleElementValue value = new CellSampleElementValue(
                    BigInteger.valueOf(cell.getValue().getFirst().longValue()),
                    Optional.empty(),
                    Optional.of((byte) 2)
            );
            CellSampleElement element = new CellSampleElement(0, cell.getOrgan().getName(), value);
            return Optional.of(new DataPoint(cell.getTheme().getText(), cell.getStatement().getText(), element));
        }

        // Try categorical cell
        Optional<CategoricalCell> categoricalCell = categoricalCellRepository.findById(
                new CategoricalCell.CategoricalCellId(xIndex, yIndex)
        );

        return categoricalCell.map(cell -> {
            String[] categories = cell.getCategory().stream()
                    .map(Category::getName)
                    .toArray(String[]::new);
            CellSampleElementValue value = new CellSampleElementValue(
                    BigInteger.ZERO,
                    Optional.of(categories),
                    Optional.empty()
            );
            CellSampleElement element = new CellSampleElement(0, cell.getOrgan().getName(), value);
            return new DataPoint(cell.getTheme().getText(), cell.getStatement().getText(), element);
        });
    }

    private List<DataPoint> loadFromBlockchain() throws Exception {
        // Simplified example - actual implementation would iterate through contract data
        log.debug("Reading data from smart contract");
        List<DataPoint> dataPoints = new ArrayList<>();

        // This is a placeholder - you would call actual contract methods here
        // Example: contractReadService.callZaryaFunction("getAllData", inputs, outputs)

        return dataPoints;
    }

    private DataPoint loadFromBlockchain(int xIndex, int yIndex) throws Exception {
        // Read specific cell from the blockchain
        @SuppressWarnings("rawtypes") List<Type> result = contractReadService.callFunction(
                contractAddress,
                "getCell",
                List.of(new Uint256(xIndex), new Uint256(yIndex)),
                List.of(new TypeReference<Uint256>() {})
        );

        BigInteger value = (BigInteger) result.getFirst().getValue();
        CellSampleElementValue cellValue = new CellSampleElementValue(
                value,
                Optional.empty(),
                Optional.of(defaultDecimals)
        );
        CellSampleElement element = new CellSampleElement(0, "unknown", cellValue);
        return new DataPoint("theme-" + xIndex, "statement-" + yIndex, element);
    }

    private void saveToCache(List<DataPoint> dataPoints) {
        log.debug("Saving {} data points to cache", dataPoints.size());
        // Implementation would save dataPoints to the database
        // This is simplified - you'd need to properly map DataPoints to Cell entities
    }

    private void clearCache() {
        numericalCellRepository.deleteAll();
        categoricalCellRepository.deleteAll();
    }
}
