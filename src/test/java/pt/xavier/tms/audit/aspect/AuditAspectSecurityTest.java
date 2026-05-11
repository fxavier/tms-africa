package pt.xavier.tms.audit.aspect;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import pt.xavier.tms.audit.annotation.Auditable;
import pt.xavier.tms.audit.event.AuditEvent;
import pt.xavier.tms.shared.enums.AuditOperation;

@ExtendWith(MockitoExtension.class)
class AuditAspectSecurityTest {

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private ProceedingJoinPoint joinPoint;

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldUseJwtSubInAuditEvent() throws Throwable {
        AuditAspect aspect = new AuditAspect(eventPublisher, new ObjectMapper());
        UUID entityId = UUID.randomUUID();
        var result = Map.of("id", entityId.toString(), "name", "x");

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user-123")
                .claim("preferred_username", "joao")
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt));

        when(joinPoint.proceed()).thenReturn(result);
        when(joinPoint.getArgs()).thenReturn(new Object[]{entityId});

        Auditable auditable = new Auditable() {
            @Override
            public String entityType() {
                return "VEHICLE";
            }

            @Override
            public AuditOperation operation() {
                return AuditOperation.ATUALIZACAO;
            }

            @Override
            public Class<? extends java.lang.annotation.Annotation> annotationType() {
                return Auditable.class;
            }
        };

        aspect.around(joinPoint, auditable);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        assertThat(captor.getValue().performedBy()).isEqualTo("user-123");
    }
}
