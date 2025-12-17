package de.fhdo.zarya.api.interfaces.repositories;

import de.fhdo.zarya.api.persistance.models.CategoricalCell;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoricalCellCRUDRepository extends CrudRepository<CategoricalCell, CategoricalCell.CategoricalCellId> {

}
