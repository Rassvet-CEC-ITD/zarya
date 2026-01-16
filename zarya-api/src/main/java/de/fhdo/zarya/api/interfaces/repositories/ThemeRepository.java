package de.fhdo.zarya.api.interfaces.repositories;

import de.fhdo.zarya.api.persistance.models.Theme;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThemeRepository extends CrudRepository<Theme, Long>, PagingAndSortingRepository<Theme, Long> {
    Optional<Theme> findByXIndexAndIsCategorical(Long XIndex, Boolean isCategorical);
}
