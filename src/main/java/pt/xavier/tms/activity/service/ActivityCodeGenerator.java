package pt.xavier.tms.activity.service;

import java.time.Year;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.activity.repository.ActivityRepository;

@Component
@RequiredArgsConstructor
public class ActivityCodeGenerator {

    private final ActivityRepository activityRepository;

    @Transactional
    public String generateActivityCode() {
        int year = Year.now().getValue();
        String prefix = "ACT-%d-".formatted(year);
        long count = activityRepository.countByCodeStartingWith(prefix);
        long sequence = count + 1;
        return "%s%04d".formatted(prefix, sequence);
    }
}
