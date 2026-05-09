package pt.xavier.tms.shared.exception;

import java.util.List;

public class AllocationException extends RuntimeException {
    private final String code;
    private final List<String> blockers;

    public AllocationException(String code, String message, List<String> blockers) {
        super(message);
        this.code = code;
        this.blockers = blockers;
    }

    public String getCode() {
        return code;
    }

    public List<String> getBlockers() {
        return blockers;
    }
}
