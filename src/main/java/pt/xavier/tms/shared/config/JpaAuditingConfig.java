package pt.xavier.tms.shared.config;

import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import pt.xavier.tms.security.SecurityUtils;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {

    @Bean
    AuditorAware<String> auditorProvider() {
        return () -> Optional.of(SecurityUtils.getCurrentUsername());
    }
}
