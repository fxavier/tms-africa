package pt.xavier.tms.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CatalogItemUpdateDto(
        @NotBlank @Size(max = 120) String name,
        String description,
        Boolean active,
        Integer sortOrder
) {
}
