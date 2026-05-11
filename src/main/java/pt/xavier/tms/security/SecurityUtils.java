package pt.xavier.tms.security;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken token && token.getTokenAttributes().containsKey("sub")) {
            Object sub = token.getTokenAttributes().get("sub");
            return sub == null ? "system" : sub.toString();
        }
        Object principal = authentication == null ? null : authentication.getPrincipal();
        if (principal instanceof Jwt jwt && jwt.getSubject() != null) {
            return jwt.getSubject();
        }
        return "system";
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken token) {
            Object preferred = token.getTokenAttributes().get("preferred_username");
            if (preferred != null && !preferred.toString().isBlank()) {
                return preferred.toString();
            }
            Object sub = token.getTokenAttributes().get("sub");
            if (sub != null && !sub.toString().isBlank()) {
                return sub.toString();
            }
        }
        return Optional.ofNullable(authentication)
                .map(Authentication::getName)
                .filter(name -> !name.isBlank())
                .orElse("system");
    }

    public static String getCurrentIpAddress() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            HttpServletRequest request = servletAttrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return "127.0.0.1";
    }

    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        String expected = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authentication.getAuthorities().stream().anyMatch(a -> expected.equals(a.getAuthority()));
    }
}
