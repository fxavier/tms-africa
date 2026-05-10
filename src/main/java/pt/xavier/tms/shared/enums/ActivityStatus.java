package pt.xavier.tms.shared.enums;

import java.util.Map;
import java.util.Set;
import pt.xavier.tms.shared.exception.BusinessException;

public enum ActivityStatus {
    PLANEADA,
    EM_CURSO,
    SUSPENSA,
    CONCLUIDA,
    CANCELADA;

    private static final Map<ActivityStatus, Set<ActivityStatus>> ALLOWED_TRANSITIONS = Map.of(
            PLANEADA, Set.of(EM_CURSO, CANCELADA, SUSPENSA),
            EM_CURSO, Set.of(SUSPENSA, CONCLUIDA, CANCELADA),
            SUSPENSA, Set.of(EM_CURSO, CANCELADA),
            CONCLUIDA, Set.of(),
            CANCELADA, Set.of()
    );

    public boolean canTransitionTo(ActivityStatus target) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public void validateTransition(ActivityStatus target) {
        if (target == null || !canTransitionTo(target)) {
            throw new BusinessException(
                    "INVALID_STATUS_TRANSITION",
                    "Invalid transition from %s to %s".formatted(this, target));
        }
    }
}
