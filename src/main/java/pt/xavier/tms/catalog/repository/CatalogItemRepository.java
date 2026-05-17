package pt.xavier.tms.catalog.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.xavier.tms.catalog.domain.CatalogCategory;
import pt.xavier.tms.catalog.domain.CatalogItem;

public interface CatalogItemRepository extends JpaRepository<CatalogItem, UUID> {

    List<CatalogItem> findByCategoryOrderBySortOrderAscNameAsc(CatalogCategory category);

    List<CatalogItem> findAllByOrderByCategoryAscSortOrderAscNameAsc();

    Optional<CatalogItem> findByCategoryAndCode(CatalogCategory category, String code);

    boolean existsByCategoryAndCode(CatalogCategory category, String code);
}
