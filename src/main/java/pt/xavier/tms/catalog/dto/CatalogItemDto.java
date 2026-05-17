package pt.xavier.tms.catalog.dto;

import java.util.UUID;
import pt.xavier.tms.catalog.domain.CatalogCategory;

public record CatalogItemDto(
        UUID id,
        CatalogCategory category,
        String code,
        String name,
        String description,
        boolean active,
        boolean systemDefault,
        int sortOrder
) {
}
