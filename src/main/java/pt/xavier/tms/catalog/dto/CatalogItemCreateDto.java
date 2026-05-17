package pt.xavier.tms.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import pt.xavier.tms.catalog.domain.CatalogCategory;

public record CatalogItemCreateDto(
        @NotNull CatalogCategory category,
        @NotBlank @Size(max = 80) @Pattern(regexp = "^[A-Z0-9_]+$") String code,
        @NotBlank @Size(max = 120) String name,
        String description,
        Boolean active,
        Integer sortOrder
) {
}
