package pt.xavier.tms.user.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import pt.xavier.tms.security.SecurityConfig;
import pt.xavier.tms.shared.exception.GlobalExceptionHandler;
import pt.xavier.tms.user.dto.UserResponseDto;
import pt.xavier.tms.user.service.UserService;

@WebMvcTest(controllers = UserController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void postUsersShouldReturn201() throws Exception {
        UserResponseDto response = new UserResponseDto("u1", "joao.silva", "joao@empresa.pt", "Joao", "Silva",
                Set.of("ADMIN"), true, Instant.now());
        when(userService.createUser(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"joao.silva",
                                  "email":"joao@empresa.pt",
                                  "firstName":"Joao",
                                  "lastName":"Silva",
                                  "roles":["ADMIN"],
                                  "enabled":true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value("u1"))
                .andExpect(jsonPath("$.error").isEmpty());
    }

    @Test
    void getMeShouldReturnCurrentProfile() throws Exception {
        UserResponseDto response = new UserResponseDto("u1", "joao.silva", "joao@empresa.pt", "Joao", "Silva",
                Set.of("ADMIN"), true, Instant.now());
        when(userService.getMe()).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("joao.silva"))
                .andExpect(jsonPath("$.error").isEmpty());
    }

    @Test
    void disableUserShouldInvalidateSessionsViaServiceFlow() throws Exception {
        mockMvc.perform(patch("/api/v1/users/u1/disable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty())
                .andExpect(jsonPath("$.error").isEmpty());

        verify(userService).setUserEnabled("u1", false);
    }

    @Test
    @Disabled("Deferred until real JWT + RBAC phase (6b/6c); security is permissive in phase 1")
    void postUsersByFleetManagerShouldReturn403AfterRbacPhase() {
    }
}
