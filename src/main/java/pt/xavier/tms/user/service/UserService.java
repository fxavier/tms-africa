package pt.xavier.tms.user.service;

import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.user.dto.UserCreateDto;
import pt.xavier.tms.user.dto.UserResponseDto;
import pt.xavier.tms.user.dto.UserUpdateDto;
import pt.xavier.tms.user.port.KeycloakUserGateway;

@Service
public class UserService {

    private final KeycloakUserGateway keycloakUserGateway;

    public UserService(KeycloakUserGateway keycloakUserGateway) {
        this.keycloakUserGateway = keycloakUserGateway;
    }

    @Transactional
    public UserResponseDto createUser(UserCreateDto dto) {
        Set<String> currentRoles = keycloakUserGateway.getCurrentUserRoles();
        if (currentRoles.contains("ADMIN") && dto.roles().contains("SUPERUSER")) {
            throw new BusinessException("SUPERUSER_ROLE_FORBIDDEN", "ADMIN cannot assign SUPERUSER role");
        }
        if (keycloakUserGateway.usernameExists(dto.username())) {
            throw new BusinessException("USERNAME_ALREADY_EXISTS", "Username already exists");
        }
        if (keycloakUserGateway.emailExists(dto.email())) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Email already exists");
        }
        return keycloakUserGateway.createUser(dto);
    }

    @Transactional
    public UserResponseDto updateUser(String userId, UserUpdateDto dto) {
        Set<String> currentRoles = keycloakUserGateway.getCurrentUserRoles();
        if (currentRoles.contains("ADMIN") && dto.roles().contains("SUPERUSER")) {
            throw new BusinessException("SUPERUSER_ROLE_FORBIDDEN", "ADMIN cannot assign SUPERUSER role");
        }
        return keycloakUserGateway.updateUser(userId, dto);
    }

    @Transactional
    public void setUserEnabled(String userId, boolean enabled) {
        String currentUserId = keycloakUserGateway.getCurrentUserId();
        if (!enabled && userId.equals(currentUserId)) {
            throw new BusinessException("SELF_DISABLE_FORBIDDEN", "You cannot disable your own account");
        }
        keycloakUserGateway.setUserEnabled(userId, enabled);
        if (!enabled) {
            keycloakUserGateway.logout(userId);
        }
    }

    @Transactional
    public void forcePasswordReset(String userId) {
        keycloakUserGateway.executeActionsEmail(userId, List.of("UPDATE_PASSWORD"));
    }

    @Transactional(readOnly = true)
    public UserResponseDto getMe() {
        return keycloakUserGateway.getCurrentUserProfile();
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> listUsers() {
        return keycloakUserGateway.listUsers();
    }
}
