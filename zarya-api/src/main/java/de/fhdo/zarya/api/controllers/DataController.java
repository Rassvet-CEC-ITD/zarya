package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.interfaces.repositories.*;
import de.fhdo.zarya.api.persistance.models.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping(value = "/auth/data", produces = "application/json")
public class DataController {
    private final OrganRepository organRepository;
    private final ThemeRepository themeRepository;
    private final StatementRepository statementRepository;
    private final NumericalCellRepository numericalCellRepository;
    private final CategoricalCellRepository categoricalCellRepository;

    @GetMapping("/cells/categorical")
    public Page<CategoricalCell> pageOfCategoricalCells(Pageable pageable) {
        return categoricalCellRepository.findAll(pageable);
    }

    @GetMapping("/cells/numerical")
    public Page<NumericalCell> pageOfNumericalCells(Pageable pageable) {
        return numericalCellRepository.findAll(pageable);
    }

    @GetMapping("/themes")
    public Page<Theme> pageOfThemes(Pageable pageable) {
        return themeRepository.findAll(pageable);
    }

    @GetMapping("/statements")
    public Page<Statement> pageOfStatements(Pageable pageable) {
        return statementRepository.findAll(pageable);
    }

    @GetMapping("/organs")
    public Page<Organ> pageOfOrgans(Pageable pageable) {
        return organRepository.findAll(pageable);
    }
}
