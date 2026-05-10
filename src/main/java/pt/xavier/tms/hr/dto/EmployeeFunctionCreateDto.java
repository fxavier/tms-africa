package pt.xavier.tms.hr.dto;

import jakarta.validation.constraints.NotBlank;

public record EmployeeFunctionCreateDto(@NotBlank String code, @NotBlank String name, String description) {
}
