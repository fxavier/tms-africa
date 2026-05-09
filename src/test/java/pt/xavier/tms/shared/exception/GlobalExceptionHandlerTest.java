package pt.xavier.tms.shared.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.MockMvc;
import pt.xavier.tms.security.SecurityConfig;

@WebMvcTest(controllers = GlobalExceptionHandlerTest.TestController.class)
@Import({GlobalExceptionHandler.class, SecurityConfig.class})
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturn404ForResourceNotFound() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.data").isEmpty())
                .andExpect(jsonPath("$.error.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void shouldReturn422ForBusinessException() throws Exception {
        mockMvc.perform(get("/test/business"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("BUSINESS_RULE"));
    }

    @Test
    void shouldReturn422ForAllocationException() throws Exception {
        mockMvc.perform(get("/test/allocation"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("ALLOCATION_BLOCKED"));
    }

    @Test
    void shouldReturn400ForValidationException() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    void shouldReturn500ForGenericException() throws Exception {
        mockMvc.perform(get("/test/generic"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error.code").value("INTERNAL_SERVER_ERROR"));
    }

    @RestController
    static class TestController {

        @GetMapping("/test/not-found")
        public void notFound() {
            throw new ResourceNotFoundException("RESOURCE_NOT_FOUND", "not found");
        }

        @GetMapping("/test/business")
        public void business() {
            throw new BusinessException("BUSINESS_RULE", "rule violated");
        }

        @GetMapping("/test/allocation")
        public void allocation() {
            throw new AllocationException("ALLOCATION_BLOCKED", "blocked", java.util.List.of("conflict"));
        }

        @PostMapping("/test/validation")
        public void validation(@RequestBody @Valid SampleRequest request) {
        }

        @GetMapping("/test/generic")
        public void generic() {
            throw new RuntimeException("boom");
        }
    }

    record SampleRequest(@NotBlank String name) {
    }
}
