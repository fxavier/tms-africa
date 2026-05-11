package pt.xavier.tms.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig config;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/v1/integration/") && !path.startsWith("/actuator/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(ip, this::newBucket);
        if (!bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"data\":null,\"error\":{\"code\":\"RATE_LIMIT_EXCEEDED\",\"message\":\"Too many requests\",\"details\":[]}}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private Bucket newBucket(String ignored) {
        Bandwidth limit = Bandwidth.classic(
                config.getCapacity(),
                Refill.greedy(config.getRefillTokens(), Duration.ofMinutes(config.getRefillMinutes())));
        return Bucket.builder().addLimit(limit).build();
    }
}
