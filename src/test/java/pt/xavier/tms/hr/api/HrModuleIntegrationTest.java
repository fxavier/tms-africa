package pt.xavier.tms.hr.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class HrModuleIntegrationTest {

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
    void hrEndpointsShouldSupportFunctionsEmployeesAndPaymentsFlow() throws Exception {
        String functionResponse = mockMvc.perform(post("/api/v1/hr/functions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"DRIVER","name":"Driver","description":"Motorista"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("DRIVER"))
                .andReturn().getResponse().getContentAsString();

        String functionId = read(functionResponse, "data", "id");

        String employeeResponse = mockMvc.perform(post("/api/v1/hr/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeNumber":"EMP-900",
                                  "fullName":"Joao Motorista",
                                  "functionId":"%s",
                                  "status":"ACTIVE",
                                  "currency":"MZN"
                                }
                                """.formatted(functionId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.employeeNumber").value("EMP-900"))
                .andReturn().getResponse().getContentAsString();

        String employeeId = read(employeeResponse, "data", "id");

        mockMvc.perform(get("/api/v1/hr/employees")
                        .param("functionId", functionId)
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(employeeId))
                .andExpect(jsonPath("$.data.content[0].functionId").value(functionId));

        mockMvc.perform(post("/api/v1/hr/salary-payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "employeeId":"%s",
                                  "periodYear":2026,
                                  "periodMonth":5,
                                  "grossAmount":10000,
                                  "netAmount":8000,
                                  "paidAmount":8000,
                                  "currency":"MZN",
                                  "paymentDate":"2026-05-10",
                                  "paymentMethod":"BANK_TRANSFER"
                                }
                                """.formatted(employeeId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PAID"));

        mockMvc.perform(get("/api/v1/hr/salary-payments/status")
                        .param("year", "2026")
                        .param("month", "5")
                        .param("status", "PAID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].paymentStatus").value("PAID"));
    }

    private String read(String json, String parent, String field) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        return node.get(parent).get(field).asText();
    }
}
