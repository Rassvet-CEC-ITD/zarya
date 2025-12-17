package de.fhdo.zarya.api.interfaces.repositories;

import de.fhdo.zarya.api.persistance.models.NumericalCell;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NumericalCellCRUDRepository extends CrudRepository<NumericalCell, NumericalCell.NumericalCellId> {

}
