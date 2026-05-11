package pt.xavier.tms.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "tms.security.rate-limit")
public class RateLimitConfig {

    private int capacity = 60;
    private int refillTokens = 60;
    private long refillMinutes = 1;
}
