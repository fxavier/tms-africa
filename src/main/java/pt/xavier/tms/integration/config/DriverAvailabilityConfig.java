package pt.xavier.tms.integration.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tms.hr")
public record DriverAvailabilityConfig(
        List<String> allowedDriverFunctionCodes
) {

    public List<String> allowedCodesOrDefault() {
        if (allowedDriverFunctionCodes == null || allowedDriverFunctionCodes.isEmpty()) {
            return List.of("DRIVER", "MOTORISTA");
        }
        return allowedDriverFunctionCodes;
    }
}
