package pt.xavier.tms.alert.service;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.alert.domain.Alert;
import pt.xavier.tms.alert.repository.AlertRepository;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class AlertResolutionService {

    private final AlertRepository alertRepository;

    @Transactional
    public Alert resolveManually(UUID alertId, String resolvedBy) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("ALERT_NOT_FOUND", "Alert not found"));
        alert.resolve(resolvedBy);
        return alertRepository.save(alert);
    }
}
