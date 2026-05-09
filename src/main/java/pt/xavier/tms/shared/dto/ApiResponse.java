package pt.xavier.tms.shared.dto;

public record ApiResponse<T>(T data, ErrorResponse error) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data, null);
    }

    public static <T> ApiResponse<T> error(ErrorResponse error) {
        return new ApiResponse<>(null, error);
    }
}
