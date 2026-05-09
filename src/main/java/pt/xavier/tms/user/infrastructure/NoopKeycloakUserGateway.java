package pt.xavier.tms.user.infrastructure;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import pt.xavier.tms.user.dto.UserCreateDto;
import pt.xavier.tms.user.dto.UserResponseDto;
import pt.xavier.tms.user.dto.UserUpdateDto;
import pt.xavier.tms.user.port.KeycloakUserGateway;

@Component
@Profile({"dev", "test", "default"})
public class NoopKeycloakUserGateway implements KeycloakUserGateway {

    @Override
    public boolean usernameExists(String username) {
        return false;
    }

    @Override
    public boolean emailExists(String email) {
        return false;
    }

    @Override
    public UserResponseDto createUser(UserCreateDto dto) {
        return new UserResponseDto("system-id", dto.username(), dto.email(), dto.firstName(), dto.lastName(), dto.roles(),
                dto.enabled(), Instant.now());
    }

    @Override
    public UserResponseDto updateUser(String userId, UserUpdateDto dto) {
        return new UserResponseDto(userId, "updated-user", dto.email(), dto.firstName(), dto.lastName(), dto.roles(),
                dto.enabled(), Instant.now());
    }

    @Override
    public UserResponseDto getUser(String userId) {
        return new UserResponseDto(userId, "system", "system@example.com", "System", "User", Set.of("ADMIN"), true,
                Instant.now());
    }

    @Override
    public void setUserEnabled(String userId, boolean enabled) {
    }

    @Override
    public void logout(String userId) {
    }

    @Override
    public void executeActionsEmail(String userId, List<String> actions) {
    }

    @Override
    public Set<String> getCurrentUserRoles() {
        return Set.of("ADMIN");
    }

    @Override
    public String getCurrentUserId() {
        return "system";
    }

    @Override
    public UserResponseDto getCurrentUserProfile() {
        return new UserResponseDto("system", "system", "system@example.com", "System", "User", Set.of("ADMIN"), true,
                Instant.now());
    }
}
