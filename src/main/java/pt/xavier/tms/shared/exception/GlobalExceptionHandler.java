package pt.xavier.tms.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.ErrorDetail;
import pt.xavier.tms.shared.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getCode(), ex.getMessage(), List.of());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, ex.getCode(), ex.getMessage(), List.of());
    }

    @ExceptionHandler(AllocationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAllocationException(AllocationException ex) {
        List<ErrorDetail> details = ex.getBlockers().stream()
                .map(blocker -> new ErrorDetail("allocation", blocker))
                .toList();
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, ex.getCode(), ex.getMessage(), details);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorDetail> details = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toErrorDetail)
                .collect(Collectors.toList());
        return buildResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed", details);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return buildResponse(HttpStatus.METHOD_NOT_ALLOWED, "METHOD_NOT_ALLOWED", ex.getMessage(), List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied", List.of());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "FILE_TOO_LARGE", "Maximum file size is 10 MB", List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        String correlationId = UUID.randomUUID().toString();
        log.error("Unhandled exception [correlationId={}] {} {}",
                correlationId,
                request.getMethod(),
                request.getRequestURI(),
                ex);
        String message = "Unexpected error occurred at %s. correlationId=%s".formatted(Instant.now(), correlationId);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", message, List.of());
    }

    private ErrorDetail toErrorDetail(FieldError fieldError) {
        return new ErrorDetail(fieldError.getField(), fieldError.getDefaultMessage());
    }

    private ResponseEntity<ApiResponse<Object>> buildResponse(HttpStatus status, String code, String message,
            List<ErrorDetail> details) {
        return ResponseEntity.status(status).body(ApiResponse.error(new ErrorResponse(code, message, details)));
    }
}
