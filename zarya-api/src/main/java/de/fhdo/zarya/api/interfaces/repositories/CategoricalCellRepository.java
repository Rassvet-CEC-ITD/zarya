package de.fhdo.zarya.api.interfaces.repositories;

import de.fhdo.zarya.api.persistance.models.CategoricalCell;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoricalCellRepository extends CrudRepository<CategoricalCell, CategoricalCell.CategoricalCellId>, PagingAndSortingRepository<CategoricalCell, CategoricalCell.CategoricalCellId> {

}
