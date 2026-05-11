package pt.xavier.tms.vehicle.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class VehicleControllerIntegrationTest {

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

    @Test
    void postVehiclesShouldReturn201() throws Exception {
        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"AA-00-BB",
                                  "brand":"Mercedes",
                                  "model":"Sprinter",
                                  "vehicleType":"FURGAO",
                                  "capacity":1000,
                                  "activityLocation":"Maputo",
                                  "activityStartDate":"2025-01-01",
                                  "notes":"Teste"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.plate").value("AA-00-BB"));
    }

    @Test
    void postVehiclesWithDuplicatePlateShouldReturn422() throws Exception {
        String payload = """
                {
                  "plate":"CC-11-DD",
                  "brand":"Toyota",
                  "model":"Hilux",
                  "vehicleType":"PICKUP",
                  "capacity":900,
                  "activityLocation":"Matola",
                  "activityStartDate":"2025-01-02",
                  "notes":"dup"
                }
                """;

        mockMvc.perform(post("/api/v1/vehicles").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/vehicles").contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("PLATE_ALREADY_EXISTS"));
    }

    @Test
    void searchByPlateShouldReturnPagedResults() throws Exception {
        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"AA-22-XY",
                                  "brand":"MAN",
                                  "model":"TGX",
                                  "vehicleType":"CAMIAO",
                                  "capacity":5000,
                                  "activityLocation":"Beira",
                                  "activityStartDate":"2025-01-03",
                                  "notes":"search"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/vehicles/search").param("q", "AA").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.page").value(0));
    }

    @Test
    void listVehiclesWithoutFiltersShouldReturnPagedResults() throws Exception {
        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"LL-33-VV",
                                  "brand":"Scania",
                                  "model":"R450",
                                  "vehicleType":"CAMIAO",
                                  "capacity":6000,
                                  "activityLocation":"Maputo",
                                  "activityStartDate":"2025-01-05",
                                  "notes":"list"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/vehicles")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void consolidatedShouldReturnAggregatedStructure() throws Exception {
        String response = mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"ZZ-88-PP",
                                  "brand":"Volvo",
                                  "model":"FH",
                                  "vehicleType":"CAMIAO",
                                  "capacity":7000,
                                  "activityLocation":"Nampula",
                                  "activityStartDate":"2025-01-04",
                                  "notes":"consolidated"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = response.replaceAll(".*\\\"id\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mockMvc.perform(get("/api/v1/vehicles/{id}/consolidated", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.vehicle.id").value(id))
                .andExpect(jsonPath("$.data.documents").isArray())
                .andExpect(jsonPath("$.data.accessories").isArray())
                .andExpect(jsonPath("$.data.maintenanceRecords").isArray())
                .andExpect(jsonPath("$.data.checklists").isArray())
                .andExpect(jsonPath("$.data.activeActivities").isArray())
                .andExpect(jsonPath("$.data.activeAlerts").isArray());
    }

    @Test
    void postVehicleWithAccessoriesShouldPersistAccessories() throws Exception {
        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "plate":"AC-55-TR",
                                  "brand":"Iveco",
                                  "model":"Daily",
                                  "vehicleType":"FURGAO",
                                  "capacity":1800,
                                  "activityLocation":"Maputo",
                                  "activityStartDate":"2025-02-01",
                                  "accessories":[
                                    {"accessoryType":"EXTINTOR","status":"PRESENTE","notes":"novo"},
                                    {"accessoryType":"TRIANGULO","status":"AUSENTE"}
                                  ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessories.length()").value(2))
                .andExpect(jsonPath("$.data.accessories[0].accessoryType").value("EXTINTOR"))
                .andExpect(jsonPath("$.data.accessories[0].status").value("PRESENTE"))
                .andExpect(jsonPath("$.data.accessories[1].accessoryType").value("TRIANGULO"))
                .andExpect(jsonPath("$.data.accessories[1].status").value("AUSENTE"));
    }
}
