package pt.xavier.tms.security;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pt.xavier.tms.activity.repository.ActivityRepository;

@Service("activitySecurityService")
@RequiredArgsConstructor
public class ActivitySecurityService {

    private final ActivityRepository activityRepository;

    public boolean isAssignedDriver(UUID activityId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        try {
            UUID driverId = UUID.fromString(currentUserId);
            return activityRepository.existsByIdAndDriver_Id(activityId, driverId);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
