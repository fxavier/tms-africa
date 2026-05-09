package pt.xavier.tms.user.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.user.dto.UserCreateDto;
import pt.xavier.tms.user.dto.UserUpdateDto;
import pt.xavier.tms.user.port.KeycloakUserGateway;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private KeycloakUserGateway keycloakUserGateway;

    @Test
    void createUserWithDuplicateUsernameShouldThrowBusinessException() {
        UserService userService = new UserService(keycloakUserGateway);
        UserCreateDto dto = new UserCreateDto("john", "john@example.com", "John", "Doe", Set.of("OPERADOR"), true);
        when(keycloakUserGateway.usernameExists("john")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    void createUserWithDuplicateEmailShouldThrowBusinessException() {
        UserService userService = new UserService(keycloakUserGateway);
        UserCreateDto dto = new UserCreateDto("john", "john@example.com", "John", "Doe", Set.of("OPERADOR"), true);
        when(keycloakUserGateway.usernameExists("john")).thenReturn(false);
        when(keycloakUserGateway.emailExists("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void updateUserWhenAdminAssignsSuperuserShouldThrowBusinessException() {
        UserService userService = new UserService(keycloakUserGateway);
        UserUpdateDto dto = new UserUpdateDto("john@example.com", "John", "Doe", Set.of("SUPERUSER"), true);
        when(keycloakUserGateway.getCurrentUserRoles()).thenReturn(Set.of("ADMIN"));

        assertThatThrownBy(() -> userService.updateUser("u1", dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ADMIN cannot assign SUPERUSER role");
    }

    @Test
    void setUserEnabledFalseForCurrentUserShouldThrowBusinessException() {
        UserService userService = new UserService(keycloakUserGateway);
        when(keycloakUserGateway.getCurrentUserId()).thenReturn("u1");

        assertThatThrownBy(() -> userService.setUserEnabled("u1", false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot disable your own");
    }

    @Test
    void forcePasswordResetShouldCallExecuteActionsEmailWithUpdatePassword() {
        UserService userService = new UserService(keycloakUserGateway);

        userService.forcePasswordReset("u1");

        verify(keycloakUserGateway).executeActionsEmail(eq("u1"), eq(java.util.List.of("UPDATE_PASSWORD")));
    }
}
