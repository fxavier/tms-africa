package pt.xavier.tms.shared.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class ApiResponseTest {

    @Test
    void shouldBuildSuccessEnvelope() {
        ApiResponse<String> response = ApiResponse.success("ok");
        assertThat(response.data()).isEqualTo("ok");
        assertThat(response.error()).isNull();
    }

    @Test
    void shouldBuildErrorEnvelope() {
        ErrorResponse error = new ErrorResponse("ERR", "failure", List.of());
        ApiResponse<Object> response = ApiResponse.error(error);
        assertThat(response.data()).isNull();
        assertThat(response.error()).isNotNull();
        assertThat(response.error().code()).isEqualTo("ERR");
    }
}
