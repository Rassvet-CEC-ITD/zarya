package de.fhdo.zarya.api.dto;

import java.util.List;

public record Page<T>(List<T> items, Page<T> next) {
}
