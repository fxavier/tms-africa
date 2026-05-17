package pt.xavier.tms.catalog.service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.catalog.domain.CatalogCategory;
import pt.xavier.tms.catalog.domain.CatalogItem;
import pt.xavier.tms.catalog.dto.CatalogItemCreateDto;
import pt.xavier.tms.catalog.dto.CatalogItemDto;
import pt.xavier.tms.catalog.dto.CatalogItemUpdateDto;
import pt.xavier.tms.catalog.repository.CatalogItemRepository;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final CatalogItemRepository repository;

    @Transactional(readOnly = true)
    public List<CatalogItemDto> list(CatalogCategory category) {
        List<CatalogItem> items = category == null
                ? repository.findAllByOrderByCategoryAscSortOrderAscNameAsc()
                : repository.findByCategoryOrderBySortOrderAscNameAsc(category);
        return items.stream().map(this::toDto).toList();
    }

    @Transactional
    public CatalogItemDto create(CatalogItemCreateDto dto) {
        String code = normalizeCode(dto.code());
        if (repository.existsByCategoryAndCode(dto.category(), code)) {
            throw new BusinessException("CATALOG_CODE_ALREADY_EXISTS", "Catalog code already exists for this category");
        }
        CatalogItem item = new CatalogItem();
        item.setId(UUID.randomUUID());
        item.setCategory(dto.category());
        item.setCode(code);
        item.setName(dto.name().trim());
        item.setDescription(blankToNull(dto.description()));
        item.setActive(dto.active() == null || dto.active());
        item.setSortOrder(dto.sortOrder() == null ? 0 : dto.sortOrder());
        item.setSystemDefault(false);
        return toDto(repository.save(item));
    }

    @Transactional
    public CatalogItemDto update(UUID id, CatalogItemUpdateDto dto) {
        CatalogItem item = getItem(id);
        item.setName(dto.name().trim());
        item.setDescription(blankToNull(dto.description()));
        if (dto.active() != null) {
            item.setActive(dto.active());
        }
        if (dto.sortOrder() != null) {
            item.setSortOrder(dto.sortOrder());
        }
        return toDto(repository.save(item));
    }

    @Transactional
    public CatalogItemDto setActive(UUID id, boolean active) {
        CatalogItem item = getItem(id);
        item.setActive(active);
        return toDto(repository.save(item));
    }

    @Transactional(readOnly = true)
    public void requireActiveCode(CatalogCategory category, String code) {
        String normalizedCode = normalizeCode(code);
        CatalogItem item = repository.findByCategoryAndCode(category, normalizedCode)
                .orElseThrow(() -> new BusinessException("CATALOG_CODE_NOT_FOUND", "Catalog code is not configured"));
        if (!item.isActive()) {
            throw new BusinessException("CATALOG_CODE_INACTIVE", "Catalog code is inactive");
        }
    }

    private CatalogItem getItem(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CATALOG_ITEM_NOT_FOUND", "Catalog item not found"));
    }

    private CatalogItemDto toDto(CatalogItem item) {
        return new CatalogItemDto(
                item.getId(),
                item.getCategory(),
                item.getCode(),
                item.getName(),
                item.getDescription(),
                item.isActive(),
                item.isSystemDefault(),
                item.getSortOrder());
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BusinessException("CATALOG_CODE_REQUIRED", "Catalog code is required");
        }
        return code.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9_]", "_");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
