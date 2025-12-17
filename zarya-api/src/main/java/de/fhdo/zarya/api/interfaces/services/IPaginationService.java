package de.fhdo.zarya.api.interfaces.services;

import de.fhdo.zarya.api.dto.Page;

import java.util.List;

public interface IPaginationService {

    /**
     * Create a paginated view of items
     */
    <T> Page<T> paginate(List<T> items, int pageSize);

    /**
     * Get a specific page
     */
    <T> Page<T> getPage(List<T> items, int pageSize, int pageNumber);
}
