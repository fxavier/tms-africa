package pt.xavier.tms.user.config;

import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import pt.xavier.tms.user.dto.UserCreateDto;
import pt.xavier.tms.user.port.KeycloakUserGateway;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuperuserInitializer implements ApplicationRunner {

    private final SuperuserProperties superuserProperties;
    private final KeycloakUserGateway keycloakUserGateway;

    @Override
    public void run(ApplicationArguments args) {
        if (superuserProperties.username() == null || superuserProperties.username().isBlank()) {
            log.warn("Superuser bootstrap skipped: tms.superuser.username is not configured");
            return;
        }

        if (keycloakUserGateway.usernameExists(superuserProperties.username())) {
            log.info("Superuser '{}' already exists", superuserProperties.username());
            return;
        }

        UserCreateDto createDto = new UserCreateDto(
                superuserProperties.username(),
                superuserProperties.email(),
                superuserProperties.firstName() == null ? "System" : superuserProperties.firstName(),
                superuserProperties.lastName() == null ? "Superuser" : superuserProperties.lastName(),
                Set.of("SUPERUSER"),
                true
        );

        keycloakUserGateway.createUser(createDto);
        log.info("Superuser '{}' created in bootstrap", superuserProperties.username());
    }
}
