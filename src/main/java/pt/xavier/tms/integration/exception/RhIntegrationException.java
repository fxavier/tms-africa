package pt.xavier.tms.integration.exception;

public class RhIntegrationException extends RuntimeException {

    public RhIntegrationException(String message) {
        super(message);
    }

    public RhIntegrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
