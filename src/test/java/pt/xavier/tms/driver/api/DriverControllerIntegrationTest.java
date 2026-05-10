package pt.xavier.tms.driver.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class DriverControllerIntegrationTest {

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
    void driverCrudAndAvailabilityShouldWork() throws Exception {
        String createResponse = mockMvc.perform(post("/api/v1/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName":"Carlos Motorista",
                                  "phone":"840000001",
                                  "address":"Maputo",
                                  "idNumber":"ID-900",
                                  "licenseNumber":"LIC-900",
                                  "licenseCategory":"C",
                                  "licenseIssueDate":"2024-01-01",
                                  "licenseExpiryDate":"2030-01-01",
                                  "activityLocation":"Maputo",
                                  "status":"ATIVO",
                                  "notes":"teste"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").exists())
                .andReturn().getResponse().getContentAsString();

        String driverId = read(createResponse, "data", "id");

        mockMvc.perform(get("/api/v1/drivers/{id}", driverId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Carlos Motorista"));

        mockMvc.perform(get("/api/v1/drivers").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());

        mockMvc.perform(put("/api/v1/drivers/{id}", driverId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName":"Carlos M.",
                                  "activityLocation":"Matola"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Carlos M."));

        mockMvc.perform(patch("/api/v1/drivers/{id}/status", driverId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"INATIVO"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INATIVO"));

        mockMvc.perform(get("/api/v1/drivers/{id}/availability", driverId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.available").value(false))
                .andExpect(jsonPath("$.data.reason").value("DRIVER_EMPLOYEE_NOT_LINKED"));

        mockMvc.perform(delete("/api/v1/drivers/{id}", driverId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.error").isEmpty());
    }

    private String read(String json, String parent, String field) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        return node.get(parent).get(field).asText();
    }
}
