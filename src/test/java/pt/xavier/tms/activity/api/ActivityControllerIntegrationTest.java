package pt.xavier.tms.activity.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Year;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import pt.xavier.tms.driver.domain.Driver;
import pt.xavier.tms.driver.repository.DriverRepository;
import pt.xavier.tms.shared.enums.DriverStatus;
import pt.xavier.tms.shared.enums.VehicleStatus;
import pt.xavier.tms.vehicle.domain.Vehicle;
import pt.xavier.tms.vehicle.repository.VehicleRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class ActivityControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("tms_test")
            .withUsername("tms_test")
            .withPassword("tms_test");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private DriverRepository driverRepository;

    private UUID maintenanceVehicleId;
    private UUID activeDriverId;

    @BeforeEach
    void seedData() {
        Vehicle vehicle = new Vehicle();
        maintenanceVehicleId = UUID.randomUUID();
        vehicle.setId(maintenanceVehicleId);
        vehicle.setPlate("AC-" + maintenanceVehicleId.toString().substring(0, 6));
        vehicle.setBrand("Toyota");
        vehicle.setModel("Hilux");
        vehicle.setVehicleType("PICKUP");
        vehicle.setCapacity(5);
        vehicle.setActivityLocation("Maputo");
        vehicle.setActivityStartDate(LocalDate.now());
        vehicle.setStatus(VehicleStatus.EM_MANUTENCAO);
        vehicleRepository.save(vehicle);

        Driver driver = new Driver();
        activeDriverId = UUID.randomUUID();
        driver.setId(activeDriverId);
        driver.setFullName("Driver " + activeDriverId.toString().substring(0, 6));
        driver.setPhone("840000123");
        driver.setAddress("Maputo");
        driver.setIdNumber("ID-" + activeDriverId.toString().substring(0, 6));
        driver.setLicenseNumber("LIC-" + activeDriverId.toString().substring(0, 6));
        driver.setLicenseCategory("C");
        driver.setLicenseIssueDate(LocalDate.now().minusYears(2));
        driver.setLicenseExpiryDate(LocalDate.now().plusYears(2));
        driver.setActivityLocation("Maputo");
        driver.setStatus(DriverStatus.ATIVO);
        driverRepository.save(driver);
    }

    @Test
    void postActivitiesShouldGenerateUniqueCodePattern() throws Exception {
        String response1 = createActivity("Entrega A");
        String response2 = createActivity("Entrega B");

        String code1 = read(response1, "data", "code");
        String code2 = read(response2, "data", "code");
        String yearPrefix = "ACT-" + Year.now().getValue() + "-";

        assertThat(code1).startsWith(yearPrefix);
        assertThat(code2).startsWith(yearPrefix);
        assertThat(code1).isNotEqualTo(code2);
    }

    @Test
    void listActivitiesWithoutFiltersShouldReturnPagedResponse() throws Exception {
        createActivity("Entrega listagem");

        mockMvc.perform(get("/api/v1/activities")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void allocateWithVehicleInMaintenanceShouldReturn422WithBlocker() throws Exception {
        String created = createActivity("Entrega bloqueada");
        String activityId = read(created, "data", "id");

        mockMvc.perform(post("/api/v1/activities/{id}/allocate", activityId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "vehicleId":"%s",
                                  "driverId":"%s",
                                  "plannedStart":"%s",
                                  "plannedEnd":"%s"
                                }
                                """.formatted(
                                maintenanceVehicleId,
                                activeDriverId,
                                OffsetDateTime.now().plusDays(1),
                                OffsetDateTime.now().plusDays(1).plusHours(2))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("ALLOCATION_BLOCKED"))
                .andExpect(jsonPath("$.error.details[0].field").value("allocation"))
                .andExpect(jsonPath("$.error.details[*].message").value(org.hamcrest.Matchers.hasItem("VEHICLE_IN_MAINTENANCE")));
    }

    @Test
    void invalidStatusTransitionShouldReturn422() throws Exception {
        String created = createActivity("Entrega status");
        String activityId = read(created, "data", "id");

        mockMvc.perform(patch("/api/v1/activities/{id}/status", activityId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"CONCLUIDA","notes":"invalid from planeada"}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("INVALID_STATUS_TRANSITION"));
    }

    private String createActivity(String title) throws Exception {
        Instant plannedStart = Instant.now().plus(Duration.ofDays(2));
        Instant plannedEnd = plannedStart.plus(Duration.ofHours(3));
        return mockMvc.perform(post("/api/v1/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title":"%s",
                                  "activityType":"ENTREGA",
                                  "location":"Maputo",
                                  "plannedStart":"%s",
                                  "plannedEnd":"%s",
                                  "priority":"MEDIA",
                                  "description":"desc",
                                  "notes":"notes"
                                }
                                """.formatted(title, plannedStart, plannedEnd)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").exists())
                .andReturn().getResponse().getContentAsString();
    }

    private String read(String json, String parent, String field) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        return node.get(parent).get(field).asText();
    }

}
