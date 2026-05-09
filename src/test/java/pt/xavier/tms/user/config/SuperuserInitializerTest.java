package pt.xavier.tms.user.config;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import pt.xavier.tms.user.port.KeycloakUserGateway;

@ExtendWith(MockitoExtension.class)
class SuperuserInitializerTest {

    @Mock
    private KeycloakUserGateway keycloakUserGateway;

    @Test
    void shouldCreateSuperuserWhenMissing() throws Exception {
        SuperuserProperties properties = new SuperuserProperties("super", "pwd", "s@tms.local", "System", "Admin");
        SuperuserInitializer initializer = new SuperuserInitializer(properties, keycloakUserGateway);
        when(keycloakUserGateway.usernameExists("super")).thenReturn(false);

        initializer.run(new DefaultApplicationArguments(new String[]{}));

        verify(keycloakUserGateway).createUser(any());
    }

    @Test
    void shouldSkipCreationWhenSuperuserExists() throws Exception {
        SuperuserProperties properties = new SuperuserProperties("super", "pwd", "s@tms.local", "System", "Admin");
        SuperuserInitializer initializer = new SuperuserInitializer(properties, keycloakUserGateway);
        when(keycloakUserGateway.usernameExists("super")).thenReturn(true);

        initializer.run(new DefaultApplicationArguments(new String[]{}));

        verify(keycloakUserGateway, never()).createUser(any());
    }
}
