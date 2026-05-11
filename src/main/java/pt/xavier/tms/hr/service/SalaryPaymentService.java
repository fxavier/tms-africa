package pt.xavier.tms.hr.service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.domain.SalaryPayment;
import pt.xavier.tms.hr.dto.EmployeePaymentStatusDto;
import pt.xavier.tms.hr.dto.SalaryPaymentCreateDto;
import pt.xavier.tms.hr.dto.SalaryPaymentResponseDto;
import pt.xavier.tms.hr.mapper.SalaryPaymentMapper;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.hr.repository.SalaryPaymentRepository;
import pt.xavier.tms.shared.enums.EmployeeStatus;
import pt.xavier.tms.shared.enums.PaymentStatusFilter;
import pt.xavier.tms.shared.enums.SalaryPaymentStatus;
import pt.xavier.tms.shared.exception.BusinessException;
import pt.xavier.tms.shared.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class SalaryPaymentService {

    private final SalaryPaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryPaymentMapper mapper;

    @Transactional
    public SalaryPaymentResponseDto registerPayment(SalaryPaymentCreateDto dto) {
        Employee employee = employeeRepository.findById(dto.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("EMPLOYEE_NOT_FOUND", "Employee not found"));
        if (employee.getStatus() != EmployeeStatus.ACTIVE) {
            throw new BusinessException("EMPLOYEE_INACTIVE", "Employee must be ACTIVE to receive payment");
        }
        if (paymentRepository.existsByEmployee_IdAndPeriodYearAndPeriodMonth(dto.employeeId(), dto.periodYear(), dto.periodMonth())) {
            throw new BusinessException("SALARY_PAYMENT_DUPLICATE_PERIOD", "Payment for this period already exists");
        }
        validatePositive(dto.paidAmount(), "paidAmount");
        validatePositive(dto.grossAmount(), "grossAmount");
        validatePositive(dto.netAmount(), "netAmount");

        SalaryPayment payment = new SalaryPayment();
        payment.setId(UUID.randomUUID());
        payment.setEmployee(employee);
        payment.setPeriodYear(dto.periodYear());
        payment.setPeriodMonth(dto.periodMonth());
        payment.setGrossAmount(dto.grossAmount());
        payment.setNetAmount(dto.netAmount());
        payment.setPaidAmount(dto.paidAmount());
        payment.setCurrency(dto.currency() == null || dto.currency().isBlank() ? "MZN" : dto.currency());
        payment.setPaymentDate(dto.paymentDate());
        payment.setPaymentMethod(dto.paymentMethod());
        payment.setReference(dto.reference());
        payment.setStatus(SalaryPaymentStatus.PAID);
        payment.setNotes(dto.notes());
        return mapper.toDto(paymentRepository.save(payment));
    }

    @Transactional
    public SalaryPaymentResponseDto cancelPayment(UUID paymentId, String reason) {
        SalaryPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("SALARY_PAYMENT_NOT_FOUND", "Salary payment not found"));
        payment.setStatus(SalaryPaymentStatus.CANCELLED);
        payment.setNotes(reason);
        return mapper.toDto(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public Page<SalaryPaymentResponseDto> listPayments(Integer year, Integer month, UUID employeeId, Pageable pageable) {
        if (employeeId != null) {
            return paymentRepository.findByEmployee_Id(employeeId, pageable).map(mapper::toDto);
        }
        if (year != null && month != null) {
            return paymentRepository.findByPeriodYearAndPeriodMonth(year, month, pageable).map(mapper::toDto);
        }
        return paymentRepository.findAll(pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EmployeePaymentStatusDto> getPaymentStatus(int year, int month, PaymentStatusFilter filter, Pageable pageable) {
        Page<Employee> employees = employeeRepository.findAll(activeEmployees(), pageable);
        Set<UUID> paidIds = new HashSet<>(paymentRepository.findPaidEmployeeIdsByPeriod(year, month, SalaryPaymentStatus.PAID));

        java.util.List<EmployeePaymentStatusDto> content = employees.getContent().stream().map(emp -> {
            boolean paid = paidIds.contains(emp.getId());
            String status = paid ? "PAID" : "UNPAID";
            if (filter == PaymentStatusFilter.PAID && !paid) {
                return null;
            }
            if (filter == PaymentStatusFilter.UNPAID && paid) {
                return null;
            }
            return new EmployeePaymentStatusDto(
                    emp.getId(),
                    emp.getEmployeeNumber(),
                    emp.getFullName(),
                    emp.getFunction() == null ? null : emp.getFunction().getName(),
                    year,
                    month,
                    status,
                    null,
                    null,
                    null
            );
        }).filter(java.util.Objects::nonNull).toList();

        return new PageImpl<>(content, pageable, employees.getTotalElements());
    }

    @Transactional(readOnly = true)
    public SalaryPaymentResponseDto getById(UUID id) {
        return mapper.toDto(paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SALARY_PAYMENT_NOT_FOUND", "Salary payment not found")));
    }

    private void validatePositive(BigDecimal value, String field) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("INVALID_PAYMENT_AMOUNT", field + " must be greater than zero");
        }
    }

    private Specification<Employee> activeEmployees() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), EmployeeStatus.ACTIVE);
    }
}
