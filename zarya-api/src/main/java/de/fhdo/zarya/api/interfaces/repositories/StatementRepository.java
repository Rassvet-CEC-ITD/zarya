package de.fhdo.zarya.api.interfaces.repositories;

import de.fhdo.zarya.api.persistance.models.Statement;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StatementRepository extends CrudRepository<Statement, Long>, PagingAndSortingRepository<Statement, Long> {
    Optional<Statement> findByYIndexAndIsCategorical(Long YIndex, boolean isCategorical);
}
