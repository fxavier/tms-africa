package pt.xavier.tms.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI tmsOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("TMS API")
                        .description("Transport Management System API")
                        .version("v1")
                        .contact(new Contact().name("TMS Team"))
                        .license(new License().name("Proprietary")));
    }
}
