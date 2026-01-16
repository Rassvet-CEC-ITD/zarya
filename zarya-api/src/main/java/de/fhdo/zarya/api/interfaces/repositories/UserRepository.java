package de.fhdo.zarya.api.interfaces.repositories;

import de.fhdo.zarya.api.persistance.models.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    Optional<User> findByName(String name);

    Boolean existsByName(String name);
}
