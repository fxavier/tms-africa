package pt.xavier.tms.user.port;

import java.util.List;
import java.util.Set;
import pt.xavier.tms.user.dto.UserCreateDto;
import pt.xavier.tms.user.dto.UserResponseDto;
import pt.xavier.tms.user.dto.UserUpdateDto;

public interface KeycloakUserGateway {

    boolean usernameExists(String username);

    boolean emailExists(String email);

    UserResponseDto createUser(UserCreateDto dto);

    UserResponseDto updateUser(String userId, UserUpdateDto dto);

    UserResponseDto getUser(String userId);

    List<UserResponseDto> listUsers();

    void setUserEnabled(String userId, boolean enabled);

    void logout(String userId);

    void executeActionsEmail(String userId, List<String> actions);

    Set<String> getCurrentUserRoles();

    String getCurrentUserId();

    UserResponseDto getCurrentUserProfile();
}
