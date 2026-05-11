package pt.xavier.tms.audit.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class AuditControllerIntegrationTest {

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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void postVehicleShouldCreateAuditLog() throws Exception {
        createVehicle("AA-11-AA");

        String auditJson = awaitAudit("VEHICLE", 1);
        JsonNode root = objectMapper.readTree(auditJson);
        assertThat(root.at("/data/content/0/entityType").asText()).isEqualTo("VEHICLE");
        assertThat(root.at("/data/content/0/operation").asText()).isEqualTo("CRIACAO");
    }

    @Test
    void putVehicleShouldCreateUpdateAuditLogWithValues() throws Exception {
        String vehicleId = createVehicle("BB-22-BB");

        mockMvc.perform(put("/api/v1/vehicles/{id}", vehicleId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "brand":"Toyota",
                                  "model":"Hilux Updated",
                                  "vehicleType":"PICKUP",
                                  "capacity":5,
                                  "activityLocation":"Matola",
                                  "activityStartDate":"%s"
                                }
                                """.formatted(LocalDate.now())))
                .andExpect(status().isOk());

        String auditJson = awaitAudit("VEHICLE", 2);
        JsonNode root = objectMapper.readTree(auditJson);
        boolean hasUpdate = false;
        for (JsonNode node : root.at("/data/content")) {
            if ("ATUALIZACAO".equals(node.get("operation").asText())) {
                hasUpdate = true;
                assertThat(node.get("newValues").isObject()).isTrue();
                break;
            }
        }
        assertThat(hasUpdate).isTrue();
    }

    @Test
    void patchActivityStatusShouldCreateAuditLog() throws Exception {
        String vehicleId = createVehicle("CC-33-CC");
        String driverId = createDriver("ID-AUD-1", "LIC-AUD-1");
        String activityId = createActivity();

        mockMvc.perform(post("/api/v1/activities/{id}/allocate", activityId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "vehicleId":"%s",
                                  "driverId":"%s",
                                  "plannedStart":"%s",
                                  "plannedEnd":"%s",
                                  "rhOverrideJustification":"override"
                                }
                                """.formatted(
                                vehicleId,
                                driverId,
                                OffsetDateTime.now().plusDays(1),
                                OffsetDateTime.now().plusDays(1).plusHours(2))))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/v1/activities/{id}/status", activityId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"EM_CURSO","notes":"start"}
                                """))
                .andExpect(status().isOk());

        String auditJson = awaitAudit("ACTIVITY", 2);
        JsonNode root = objectMapper.readTree(auditJson);
        boolean found = false;
        for (JsonNode node : root.at("/data/content")) {
            if ("ATUALIZACAO".equals(node.get("operation").asText())) {
                found = true;
                break;
            }
        }
        assertThat(found).isTrue();
    }

    @Test
    void getAuditWithEntityTypeFilterShouldReturnOnlyThatType() throws Exception {
        createVehicle("DD-44-DD");
        awaitAudit("VEHICLE", 1);

        String response = mockMvc.perform(get("/api/v1/audit")
                        .param("entityType", "VEHICLE")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode root = objectMapper.readTree(response);
        for (JsonNode node : root.at("/data/content")) {
            assertThat(node.get("entityType").asText()).isEqualTo("VEHICLE");
        }
    }

    @Test
    void auditShouldNotSupportWriteEndpoints() throws Exception {
        int statusCode = mockMvc.perform(post("/api/v1/audit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andReturn().getResponse().getStatus();
        assertThat(statusCode).isBetween(400, 499);
    }

    private String awaitAudit(String entityType, int minCount) throws Exception {
        for (int i = 0; i < 20; i++) {
            String response = mockMvc.perform(get("/api/v1/audit")
                            .param("entityType", entityType)
                            .param("size", "50"))
                    .andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();
            JsonNode root = objectMapper.readTree(response);
            if (root.at("/data/content").size() >= minCount) {
                return response;
            }
            Thread.sleep(200);
        }
        return mockMvc.perform(get("/api/v1/audit")
                        .param("entityType", entityType)
                        .param("size", "50"))
                .andReturn().getResponse().getContentAsString();
    }

    private String createVehicle(String plate) throws Exception {
        String response = mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"%s",
                                  "brand":"Toyota",
                                  "model":"Hilux",
                                  "vehicleType":"PICKUP",
                                  "capacity":5,
                                  "activityLocation":"Maputo",
                                  "activityStartDate":"%s"
                                }
                                """.formatted(plate, LocalDate.now())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return read(response, "data", "id");
    }

    private String createDriver(String idNumber, String licenseNumber) throws Exception {
        String response = mockMvc.perform(post("/api/v1/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName":"Driver A",
                                  "phone":"840000009",
                                  "address":"Maputo",
                                  "idNumber":"%s",
                                  "licenseNumber":"%s",
                                  "licenseCategory":"C",
                                  "licenseIssueDate":"2024-01-01",
                                  "licenseExpiryDate":"2030-01-01",
                                  "activityLocation":"Maputo",
                                  "status":"ATIVO"
                                }
                                """.formatted(idNumber, licenseNumber)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return read(response, "data", "id");
    }

    private String createActivity() throws Exception {
        Instant start = Instant.now().plusSeconds(7200);
        Instant end = start.plusSeconds(7200);
        String response = mockMvc.perform(post("/api/v1/activities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title":"Audit Activity",
                                  "activityType":"ENTREGA",
                                  "location":"Maputo",
                                  "plannedStart":"%s",
                                  "plannedEnd":"%s",
                                  "priority":"MEDIA"
                                }
                                """.formatted(start, end)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return read(response, "data", "id");
    }

    private String read(String json, String parent, String field) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        return node.get(parent).get(field).asText();
    }
}
