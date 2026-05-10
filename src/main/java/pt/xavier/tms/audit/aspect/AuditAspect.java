package pt.xavier.tms.audit.aspect;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.audit.event.AuditEvent;
import pt.xavier.tms.security.SecurityUtils;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Around("@annotation(auditable)")
    public Object around(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        Map<String, Object> previousValues = Map.of();
        Object result = joinPoint.proceed();
        Map<String, Object> newValues = asMap(result);
        UUID entityId = extractEntityId(result);

        eventPublisher.publishEvent(AuditEvent.of(
                auditable.entityType(),
                entityId,
                auditable.operation(),
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.getCurrentIpAddress(),
                previousValues,
                newValues));

        return result;
    }

    private Map<String, Object> asMap(Object value) {
        if (value == null) {
            return Map.of();
        }
        return objectMapper.convertValue(value, new TypeReference<>() {
        });
    }

    private UUID extractEntityId(Object result) {
        if (result == null) {
            return null;
        }
        Map<String, Object> map = asMap(result);
        Object id = map.get("id");
        if (id == null) {
            return null;
        }
        try {
            return UUID.fromString(id.toString());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
