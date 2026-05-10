package pt.xavier.tms.hr.api;

import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.xavier.tms.hr.dto.EmployeePaymentStatusDto;
import pt.xavier.tms.hr.dto.SalaryPaymentCreateDto;
import pt.xavier.tms.hr.dto.SalaryPaymentResponseDto;
import pt.xavier.tms.hr.service.SalaryPaymentService;
import pt.xavier.tms.shared.dto.ApiResponse;
import pt.xavier.tms.shared.dto.PagedResponse;
import pt.xavier.tms.shared.enums.PaymentStatusFilter;

@RestController
@RequestMapping("/api/v1/hr/salary-payments")
@RequiredArgsConstructor
public class SalaryPaymentController {

    private final SalaryPaymentService service;

    @PostMapping
    public ResponseEntity<ApiResponse<SalaryPaymentResponseDto>> create(@Valid @RequestBody SalaryPaymentCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.registerPayment(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SalaryPaymentResponseDto>>> list(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<SalaryPaymentResponseDto> result = service.listPayments(year, month, employeeId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalaryPaymentResponseDto>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SalaryPaymentResponseDto>> cancel(@PathVariable UUID id,
            @RequestBody CancelPaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.cancelPayment(id, request.reason())));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<PagedResponse<EmployeePaymentStatusDto>>> paymentStatus(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(defaultValue = "ALL") PaymentStatusFilter status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<EmployeePaymentStatusDto> result = service.getPaymentStatus(year, month, status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages())));
    }

    public record CancelPaymentRequest(String reason) {
    }
}
