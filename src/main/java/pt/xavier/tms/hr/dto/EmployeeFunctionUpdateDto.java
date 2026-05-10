package pt.xavier.tms.hr.dto;

import jakarta.validation.constraints.NotBlank;

public record EmployeeFunctionUpdateDto(@NotBlank String name, String description) {
}
