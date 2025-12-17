package de.fhdo.zarya.api.controllers;

import de.fhdo.zarya.api.interfaces.repositories.*;
import de.fhdo.zarya.api.persistance.models.*;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;

@Controller
public class RawDataController {

    private final OrganCRUDRepository organRepository;
    private final ThemeCRUDRepository themeRepository;
    private final CategoryCRUDRepository categoryRepository;
    private final StatementCRUDRepository statementRepository;
    private final NumericalCellCRUDRepository numericalCellRepository;
    private final CategoricalCellCRUDRepository categoricalCellRepository;

    @Autowired
    public RawDataController(
            OrganCRUDRepository organRepository,
            ThemeCRUDRepository themeRepository,
            CategoryCRUDRepository categoryRepository,
            StatementCRUDRepository statementRepository,
            NumericalCellCRUDRepository numericalCellRepository,
            CategoricalCellCRUDRepository categoricalCellRepository) {
        this.organRepository = organRepository;
        this.themeRepository = themeRepository;
        this.categoryRepository = categoryRepository;
        this.statementRepository = statementRepository;
        this.numericalCellRepository = numericalCellRepository;
        this.categoricalCellRepository = categoricalCellRepository;
    }

    private <T, ID> T findById(CrudRepository<T, ID> repository, @NonNull ID id, String entityName) {
        Optional<T> result = repository.findById(id);
        return result.orElseThrow(() -> new RuntimeException(entityName + " not found"));
    }

    // Query mappings
    @QueryMapping
    public List<Organ> organs() {
        return (List<Organ>) organRepository.findAll();
    }

    @QueryMapping
    public Organ organ(@Argument Long id) {
        return findById(organRepository, id, "Organ");
    }

    @QueryMapping
    public List<Theme> themes() {
        return (List<Theme>) themeRepository.findAll();
    }

    @QueryMapping
    public Theme theme(@Argument Long id) {
        return findById(themeRepository, id, "Theme");
    }

    @QueryMapping
    public List<Category> categories() {
        return (List<Category>) categoryRepository.findAll();
    }

    @QueryMapping
    public Category category(@Argument Long id) {
        return findById(categoryRepository, id, "Category");
    }

    @QueryMapping
    public List<Statement> statements() {
        return (List<Statement>) statementRepository.findAll();
    }

    @QueryMapping
    public Statement statement(@Argument Long id) {
        return findById(statementRepository, id, "Statement");
    }

    @QueryMapping
    public List<NumericalCell> numericalCells() {
        return (List<NumericalCell>) numericalCellRepository.findAll();
    }

    @QueryMapping
    public NumericalCell numericalCell(@Argument int xIndex, @Argument int yIndex) {
        return findById(numericalCellRepository, new NumericalCell.NumericalCellId(xIndex, yIndex), "NumericalCell");
    }

    @QueryMapping
    public List<CategoricalCell> categoricalCells() {
        return (List<CategoricalCell>) categoricalCellRepository.findAll();
    }

    @QueryMapping
    public CategoricalCell categoricalCell(@Argument int xIndex, @Argument int yIndex) {
        return findById(categoricalCellRepository, new CategoricalCell.CategoricalCellId(xIndex, yIndex), "CategoricalCell");
    }

    // Mutation mappings
    @MutationMapping
    public Organ createOrgan(@Argument String name) {
        Organ organ = new Organ();
        organ.setName(name);
        return organRepository.save(organ);
    }

    @MutationMapping
    public Organ updateOrgan(@Argument Long id, @Argument String name) {
        Organ organ = findById(organRepository, id, "Organ");
        organ.setName(name);
        return organRepository.save(organ);
    }

    @MutationMapping
    public Boolean deleteOrgan(@Argument Long id) {
        organRepository.deleteById(id);
        return true;
    }

    @MutationMapping
    public Theme createTheme(@Argument String text, @Argument Boolean isCategorical, @Argument Long xIndex) {
        Theme theme = new Theme();
        theme.setText(text);
        theme.setCategorical(isCategorical);
        theme.setXIndex(xIndex);
        return themeRepository.save(theme);
    }

    @MutationMapping
    public Theme updateTheme(@Argument Long id, @Argument String text, @Argument Boolean isCategorical, @Argument Long xIndex) {
        Theme theme = findById(themeRepository, id, "Theme");
        if (text != null) theme.setText(text);
        if (isCategorical != null) theme.setCategorical(isCategorical);
        if (xIndex != null) theme.setXIndex(xIndex);
        return themeRepository.save(theme);
    }

    @MutationMapping
    public Boolean deleteTheme(@Argument Long id) {
        themeRepository.deleteById(id);
        return true;
    }

    @MutationMapping
    public Category createCategory(@Argument String name) {
        Category category = new Category();
        category.setName(name);
        return categoryRepository.save(category);
    }

    @MutationMapping
    public Category updateCategory(@Argument Long id, @Argument String name) {
        Category category = findById(categoryRepository, id, "Category");
        category.setName(name);
        return categoryRepository.save(category);
    }

    @MutationMapping
    public Boolean deleteCategory(@Argument Long id) {
        categoryRepository.deleteById(id);
        return true;
    }

    @MutationMapping
    public Statement createStatement(@Argument String text, @Argument Long yIndex) {
        Statement statement = new Statement();
        statement.setText(text);
        statement.setYIndex(yIndex);
        return statementRepository.save(statement);
    }

    @MutationMapping
    public Statement updateStatement(@Argument Long id, @Argument String text, @Argument Long yIndex) {
        Statement statement = findById(statementRepository, id, "Statement");
        if (text != null) statement.setText(text);
        if (yIndex != null) statement.setYIndex(yIndex);
        return statementRepository.save(statement);
    }

    @MutationMapping
    public Boolean deleteStatement(@Argument Long id) {
        statementRepository.deleteById(id);
        return true;
    }

    @MutationMapping
    public NumericalCell createNumericalCell(@Argument int xIndex, @Argument int yIndex, @Argument Long themeId, @Argument Long statementId, @Argument Long organId, @Argument List<Double> value) {
        NumericalCell cell = new NumericalCell();
        cell.setXIndex(xIndex);
        cell.setYIndex(yIndex);
        cell.setTheme(findById(themeRepository, themeId, "Theme"));
        cell.setStatement(findById(statementRepository, statementId, "Statement"));
        cell.setOrgan(findById(organRepository, organId, "Organ"));
        cell.setValue(value);
        return numericalCellRepository.save(cell);
    }

    @MutationMapping
    public NumericalCell updateNumericalCell(@Argument int xIndex, @Argument int yIndex, @Argument Long themeId, @Argument Long statementId, @Argument Long organId, @Argument List<Double> value) {
        NumericalCell cell = findById(numericalCellRepository, new NumericalCell.NumericalCellId(xIndex, yIndex), "NumericalCell");
        if (themeId != null) cell.setTheme(findById(themeRepository, themeId, "Theme"));
        if (statementId != null) cell.setStatement(findById(statementRepository, statementId, "Statement"));
        if (organId != null) cell.setOrgan(findById(organRepository, organId, "Organ"));
        if (value != null) cell.setValue(value);
        return numericalCellRepository.save(cell);
    }

    @MutationMapping
    public Boolean deleteNumericalCell(@Argument int xIndex, @Argument int yIndex) {
        numericalCellRepository.deleteById(new NumericalCell.NumericalCellId(xIndex, yIndex));
        return true;
    }

    @MutationMapping
    public CategoricalCell createCategoricalCell(@Argument int xIndex, @Argument int yIndex, @Argument Long themeId, @Argument Long statementId, @Argument Long organId, @Argument List<Long> categoryIds) {
        CategoricalCell cell = new CategoricalCell();
        cell.setXIndex(xIndex);
        cell.setYIndex(yIndex);
        cell.setTheme(findById(themeRepository, themeId, "Theme"));
        cell.setStatement(findById(statementRepository, statementId, "Statement"));
        cell.setOrgan(findById(organRepository, organId, "Organ"));
        cell.setCategory(categoryIds.stream().map(id -> findById(categoryRepository, id, "Category")).toList());
        return categoricalCellRepository.save(cell);
    }

    @MutationMapping
    public CategoricalCell updateCategoricalCell(@Argument int xIndex, @Argument int yIndex, @Argument Long themeId, @Argument Long statementId, @Argument Long organId, @Argument List<Long> categoryIds) {
        CategoricalCell cell = findById(categoricalCellRepository, new CategoricalCell.CategoricalCellId(xIndex, yIndex), "CategoricalCell");
        if (themeId != null) cell.setTheme(findById(themeRepository, themeId, "Theme"));
        if (statementId != null) cell.setStatement(findById(statementRepository, statementId, "Statement"));
        if (organId != null) cell.setOrgan(findById(organRepository, organId, "Organ"));
        if (categoryIds != null) cell.setCategory(categoryIds.stream().map(id -> findById(categoryRepository, id, "Category")).toList());
        return categoricalCellRepository.save(cell);
    }

    @MutationMapping
    public Boolean deleteCategoricalCell(@Argument int xIndex, @Argument int yIndex) {
        categoricalCellRepository.deleteById(new CategoricalCell.CategoricalCellId(xIndex, yIndex));
        return true;
    }
}
