package pt.xavier.tms.user.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tms.superuser")
public record SuperuserProperties(
        String username,
        String password,
        String email,
        String firstName,
        String lastName
) {
}
