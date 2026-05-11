package pt.xavier.tms.alert.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlertScheduler {

    private final AlertService alertService;

    @Transactional
    @Scheduled(cron = "${tms.scheduling.alert-check-cron:0 0 6 * * *}")
    public void runDailyAlertCheck() {
        log.info("Starting daily alert check");
        alertService.checkDocumentExpiry();
        alertService.checkMaintenanceDue();
        alertService.resolveObsoleteAlerts();
        log.info("Finished daily alert check");
    }
}
