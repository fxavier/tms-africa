package pt.xavier.tms.user.infrastructure;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import pt.xavier.tms.user.dto.UserCreateDto;
import pt.xavier.tms.user.dto.UserResponseDto;
import pt.xavier.tms.user.dto.UserUpdateDto;
import pt.xavier.tms.user.port.KeycloakUserGateway;

@Component
@Profile({"dev", "test", "default"})
public class NoopKeycloakUserGateway implements KeycloakUserGateway {

    private final CopyOnWriteArrayList<UserResponseDto> users = new CopyOnWriteArrayList<>();

    @Override
    public boolean usernameExists(String username) {
        return listUsers().stream().anyMatch(user -> user.username().equalsIgnoreCase(username));
    }

    @Override
    public boolean emailExists(String email) {
        return listUsers().stream().anyMatch(user -> user.email().equalsIgnoreCase(email));
    }

    @Override
    public UserResponseDto createUser(UserCreateDto dto) {
        UserResponseDto user = new UserResponseDto(UUID.randomUUID().toString(), dto.username(), dto.email(),
                dto.firstName(), dto.lastName(), dto.roles(),
                dto.enabled(), Instant.now());
        users.add(user);
        return user;
    }

    @Override
    public UserResponseDto updateUser(String userId, UserUpdateDto dto) {
        UserResponseDto updated = new UserResponseDto(userId, "updated-user", dto.email(), dto.firstName(), dto.lastName(), dto.roles(),
                dto.enabled(), Instant.now());
        users.replaceAll(user -> user.id().equals(userId) ? updated : user);
        return updated;
    }

    @Override
    public UserResponseDto getUser(String userId) {
        return listUsers().stream()
                .filter(user -> user.id().equals(userId))
                .findFirst()
                .orElseGet(() -> new UserResponseDto(userId, "system", "system@example.com", "System", "User",
                        Set.of("ADMIN"), true, Instant.now()));
    }

    @Override
    public List<UserResponseDto> listUsers() {
        List<UserResponseDto> result = new ArrayList<>();
        result.add(getCurrentUserProfile());
        result.addAll(users);
        return result;
    }

    @Override
    public void setUserEnabled(String userId, boolean enabled) {
        users.replaceAll(user -> user.id().equals(userId)
                ? new UserResponseDto(user.id(), user.username(), user.email(), user.firstName(), user.lastName(),
                        user.roles(), enabled, user.createdAt())
                : user);
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
