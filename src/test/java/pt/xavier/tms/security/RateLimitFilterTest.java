package pt.xavier.tms.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTest {

    @Test
    void shouldBlockAfter60RequestsPerMinutePerIp() throws Exception {
        RateLimitConfig config = new RateLimitConfig();
        config.setCapacity(60);
        config.setRefillTokens(60);
        config.setRefillMinutes(1);
        RateLimitFilter filter = new RateLimitFilter(config);

        for (int i = 0; i < 60; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("GET", "/actuator/health");
            request.setRemoteAddr("10.0.0.1");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, new MockFilterChain());
            assertThat(response.getStatus()).isNotEqualTo(429);
        }

        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("GET", "/actuator/health");
        blockedRequest.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        filter.doFilter(blockedRequest, blockedResponse, new MockFilterChain());

        assertThat(blockedResponse.getStatus()).isEqualTo(429);
    }
}
