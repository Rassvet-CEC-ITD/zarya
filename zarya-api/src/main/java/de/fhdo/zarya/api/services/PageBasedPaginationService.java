package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.dto.Page;
import de.fhdo.zarya.api.interfaces.services.IPaginationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class PageBasedPaginationService implements IPaginationService {

    @Override
    public <T> Page<T> paginate(List<T> items, int pageSize) {
        if (items == null || items.isEmpty()) {
            return new Page<>(List.of(), null);
        }

        if (pageSize <= 0) {
            throw new IllegalArgumentException("Page size must be positive");
        }

        return getPage(items, pageSize, 0);
    }

    @Override
    public <T> Page<T> getPage(List<T> items, int pageSize, int pageNumber) {
        if (items == null || items.isEmpty()) {
            return new Page<>(List.of(), null);
        }

        if (pageSize <= 0) {
            throw new IllegalArgumentException("Page size must be positive");
        }

        if (pageNumber < 0) {
            throw new IllegalArgumentException("Page number must be non-negative");
        }

        int startIndex = pageNumber * pageSize;

        // Check if page is out of bounds
        if (startIndex >= items.size()) {
            return new Page<>(List.of(), null);
        }

        int endIndex = Math.min(startIndex + pageSize, items.size());
        List<T> pageItems = new ArrayList<>(items.subList(startIndex, endIndex));

        // Check if there's a next page
        Page<T> nextPage = null;
        if (endIndex < items.size()) {
            nextPage = getPage(items, pageSize, pageNumber + 1);
        }

        log.debug("Created page {} with {} items (total: {})", pageNumber, pageItems.size(), items.size());

        return new Page<>(pageItems, nextPage);
    }
}
