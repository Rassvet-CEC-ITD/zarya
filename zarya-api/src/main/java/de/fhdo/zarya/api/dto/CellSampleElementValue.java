package de.fhdo.zarya.api.dto;

import java.math.BigInteger;
import java.util.Optional;

public record CellSampleElementValue(BigInteger rawValue, Optional<String[]> allowedCategories, Optional<Byte> decimals) {
    public String asCategory() {
        String[] categories = allowedCategories.orElseThrow();
        return categories[rawValue.intValue() % categories.length];
    }

    public double asDouble() {
        return rawValue.doubleValue() / Math.pow(10, decimals.orElseThrow());
    }
}
