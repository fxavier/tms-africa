package pt.xavier.tms.alert.api;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.alert.domain.AlertConfiguration;
import pt.xavier.tms.alert.dto.AlertConfigurationDto;
import pt.xavier.tms.alert.dto.AlertConfigurationUpdateDto;
import pt.xavier.tms.alert.repository.AlertConfigurationRepository;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/v1/alert-configurations")
@RequiredArgsConstructor
public class AlertConfigurationController {

    private final AlertConfigurationRepository alertConfigurationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertConfigurationDto>>> list() {
        List<AlertConfigurationDto> items = alertConfigurationRepository.findAll().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<AlertConfigurationDto>> update(@PathVariable UUID id,
            @RequestBody AlertConfigurationUpdateDto dto) {
        AlertConfiguration cfg = alertConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ALERT_CONFIGURATION_NOT_FOUND", "Alert configuration not found"));
        if (dto.daysBeforeWarning() != null) cfg.setDaysBeforeWarning(dto.daysBeforeWarning());
        if (dto.daysBeforeCritical() != null) cfg.setDaysBeforeCritical(dto.daysBeforeCritical());
        if (dto.active() != null) cfg.setActive(dto.active());
        return ResponseEntity.ok(ApiResponse.success(toDto(alertConfigurationRepository.save(cfg))));
    }

    private AlertConfigurationDto toDto(AlertConfiguration cfg) {
        return new AlertConfigurationDto(
                cfg.getId(),
                cfg.getAlertType(),
                cfg.getEntityType(),
                cfg.getDaysBeforeWarning(),
                cfg.getDaysBeforeCritical(),
                cfg.isActive());
    }
}
