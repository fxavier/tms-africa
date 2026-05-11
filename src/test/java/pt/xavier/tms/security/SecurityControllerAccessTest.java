package pt.xavier.tms.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;
import pt.xavier.tms.activity.api.ActivityController;
import pt.xavier.tms.activity.dto.ActivityResponseDto;
import pt.xavier.tms.activity.service.ActivityService;
import pt.xavier.tms.alert.api.AlertConfigurationController;
import pt.xavier.tms.alert.api.AlertController;
import pt.xavier.tms.alert.repository.AlertConfigurationRepository;
import pt.xavier.tms.alert.repository.AlertRepository;
import pt.xavier.tms.alert.service.AlertResolutionService;
import pt.xavier.tms.audit.api.AuditController;
import pt.xavier.tms.audit.service.AuditService;
import pt.xavier.tms.driver.api.DriverController;
import pt.xavier.tms.driver.service.DriverService;
import pt.xavier.tms.hr.api.EmployeeController;
import pt.xavier.tms.hr.api.EmployeeFunctionController;
import pt.xavier.tms.hr.api.SalaryPaymentController;
import pt.xavier.tms.hr.service.EmployeeFunctionService;
import pt.xavier.tms.hr.service.EmployeeService;
import pt.xavier.tms.hr.service.SalaryPaymentService;
import pt.xavier.tms.integration.api.FileController;
import pt.xavier.tms.integration.port.FileStoragePort;
import pt.xavier.tms.shared.enums.ActivityPriority;
import pt.xavier.tms.shared.enums.ActivityStatus;
import pt.xavier.tms.shared.exception.GlobalExceptionHandler;
import pt.xavier.tms.user.api.UserController;
import pt.xavier.tms.user.service.UserService;
import pt.xavier.tms.vehicle.api.ChecklistController;
import pt.xavier.tms.vehicle.api.MaintenanceController;
import pt.xavier.tms.vehicle.api.VehicleController;
import pt.xavier.tms.vehicle.api.VehicleDocumentController;
import pt.xavier.tms.vehicle.service.ChecklistService;
import pt.xavier.tms.vehicle.service.MaintenanceService;
import pt.xavier.tms.vehicle.service.VehicleDocumentService;
import pt.xavier.tms.vehicle.service.VehicleService;

@WebMvcTest(controllers = {
        VehicleController.class,
        VehicleDocumentController.class,
        MaintenanceController.class,
        ChecklistController.class,
        DriverController.class,
        ActivityController.class,
        AlertController.class,
        AlertConfigurationController.class,
        AuditController.class,
        EmployeeController.class,
        EmployeeFunctionController.class,
        SalaryPaymentController.class,
        FileController.class,
        UserController.class
})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class SecurityControllerAccessTest {

    @TestConfiguration
    static class LocalSecurityBeans {
        @Bean
        RateLimitConfig rateLimitConfig() {
            RateLimitConfig cfg = new RateLimitConfig();
            cfg.setCapacity(60);
            cfg.setRefillTokens(60);
            cfg.setRefillMinutes(1);
            return cfg;
        }

        @Bean
        RateLimitFilter rateLimitFilter(RateLimitConfig config) {
            return new RateLimitFilter(config);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtDecoder jwtDecoder;
    @MockBean private KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter;
    @MockBean private ActivitySecurityService activitySecurityService;

    @MockBean private VehicleService vehicleService;
    @MockBean private VehicleDocumentService vehicleDocumentService;
    @MockBean private MaintenanceService maintenanceService;
    @MockBean private ChecklistService checklistService;
    @MockBean private DriverService driverService;
    @MockBean private ActivityService activityService;
    @MockBean private AlertRepository alertRepository;
    @MockBean private AlertResolutionService alertResolutionService;
    @MockBean private AlertConfigurationRepository alertConfigurationRepository;
    @MockBean private AuditService auditService;
    @MockBean private EmployeeService employeeService;
    @MockBean private EmployeeFunctionService employeeFunctionService;
    @MockBean private SalaryPaymentService salaryPaymentService;
    @MockBean private FileStoragePort fileStoragePort;
    @MockBean private UserService userService;

    @Test
    void requestWithoutJwtShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/vehicles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithInsufficientRoleShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/vehicles")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_MOTORISTA"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void motoristaShouldNotAccessManagementEndpoints() throws Exception {
        mockMvc.perform(post("/api/v1/vehicles")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_MOTORISTA")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"AA-00-XY",
                                  "brand":"Toyota",
                                  "model":"Hilux",
                                  "vehicleType":"PICKUP",
                                  "capacity":5,
                                  "activityLocation":"Maputo",
                                  "activityStartDate":"2026-01-01"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void motoristaShouldSeeOnlyAssignedActivities() throws Exception {
        UUID activityId = UUID.randomUUID();
        when(activitySecurityService.isAssignedDriver(activityId)).thenReturn(false);

        mockMvc.perform(get("/api/v1/activities/{id}", activityId)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_MOTORISTA"))))
                .andExpect(status().isForbidden());

        when(activitySecurityService.isAssignedDriver(activityId)).thenReturn(true);
        when(activityService.getActivity(activityId)).thenReturn(new ActivityResponseDto(
                activityId,
                "ACT-2026-0001",
                "Entrega",
                "ENTREGA",
                "Maputo",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                null,
                null,
                ActivityPriority.MEDIA,
                ActivityStatus.PLANEADA,
                null,
                null,
                null,
                null,
                null));

        mockMvc.perform(get("/api/v1/activities/{id}", activityId)
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_MOTORISTA"))))
                .andExpect(status().isOk());
    }
}
