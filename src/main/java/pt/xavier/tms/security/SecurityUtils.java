package pt.xavier.tms.security;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static String getCurrentUserId() {
        return "system";
    }

    public static String getCurrentUsername() {
        return "system";
    }

    public static String getCurrentIpAddress() {
        return "127.0.0.1";
    }

    public static boolean hasRole(String role) {
        return true;
    }
}
