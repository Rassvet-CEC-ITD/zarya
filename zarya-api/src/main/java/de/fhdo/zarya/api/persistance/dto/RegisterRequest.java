package de.fhdo.zarya.api.persistance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank
    @Size(max = 200)
    private String contact;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
}