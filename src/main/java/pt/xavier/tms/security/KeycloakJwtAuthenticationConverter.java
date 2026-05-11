package pt.xavier.tms.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt source) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        Object realmAccess = source.getClaim("realm_access");
        if (realmAccess instanceof Map<?, ?> map) {
            Object roles = map.get("roles");
            if (roles instanceof List<?> list) {
                list.stream()
                        .map(Object::toString)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(String::toUpperCase)
                        .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                        .map(SimpleGrantedAuthority::new)
                        .forEach(authorities::add);
            }
        }
        return new JwtAuthenticationToken(source, authorities, principalName(source));
    }

    private String principalName(Jwt jwt) {
        String preferred = jwt.getClaimAsString("preferred_username");
        if (preferred != null && !preferred.isBlank()) {
            return preferred;
        }
        return jwt.getSubject();
    }
}
