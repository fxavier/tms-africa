package pt.xavier.tms.hr.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import pt.xavier.tms.hr.domain.Employee;
import pt.xavier.tms.hr.domain.SalaryPayment;
import pt.xavier.tms.hr.dto.SalaryPaymentCreateDto;
import pt.xavier.tms.hr.dto.SalaryPaymentResponseDto;
import pt.xavier.tms.hr.mapper.SalaryPaymentMapper;
import pt.xavier.tms.hr.repository.EmployeeRepository;
import pt.xavier.tms.hr.repository.SalaryPaymentRepository;
import pt.xavier.tms.shared.enums.EmployeeStatus;
import pt.xavier.tms.shared.enums.PaymentMethod;
import pt.xavier.tms.shared.enums.PaymentStatusFilter;
import pt.xavier.tms.shared.enums.SalaryPaymentStatus;
import pt.xavier.tms.shared.exception.BusinessException;

@ExtendWith(MockitoExtension.class)
class SalaryPaymentServiceTest {

    @Mock private SalaryPaymentRepository paymentRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private SalaryPaymentMapper mapper;

    @InjectMocks
    private SalaryPaymentService service;

    @Test
    void duplicatePeriodShouldThrowBusinessException() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = new Employee();
        employee.setId(employeeId);
        employee.setStatus(EmployeeStatus.ACTIVE);
        when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(paymentRepository.existsByEmployee_IdAndPeriodYearAndPeriodMonth(employeeId, 2026, 5)).thenReturn(true);

        SalaryPaymentCreateDto dto = new SalaryPaymentCreateDto(employeeId, 2026, 5,
                BigDecimal.TEN, BigDecimal.TEN, BigDecimal.TEN,
                "MZN", LocalDate.now(), PaymentMethod.CASH, null, null);

        assertThatThrownBy(() -> service.registerPayment(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void cancelPaymentShouldSetCancelledStatus() {
        UUID paymentId = UUID.randomUUID();
        SalaryPayment payment = new SalaryPayment();
        payment.setId(paymentId);
        payment.setStatus(SalaryPaymentStatus.PAID);
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(SalaryPayment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toDto(any(SalaryPayment.class))).thenAnswer(inv -> {
            SalaryPayment p = inv.getArgument(0);
            return new SalaryPaymentResponseDto(p.getId(), null, null, null, null, null,
                    null, null, null, null, null, p.getStatus(), p.getNotes());
        });

        SalaryPaymentResponseDto result = service.cancelPayment(paymentId, "reversal");

        assertThat(result.status()).isEqualTo(SalaryPaymentStatus.CANCELLED);
    }

    @Test
    void paymentStatusShouldReturnPaidAndUnpaid() {
        Employee e1 = new Employee();
        e1.setId(UUID.randomUUID());
        e1.setEmployeeNumber("E1");
        e1.setFullName("One");
        e1.setStatus(EmployeeStatus.ACTIVE);
        Employee e2 = new Employee();
        e2.setId(UUID.randomUUID());
        e2.setEmployeeNumber("E2");
        e2.setFullName("Two");
        e2.setStatus(EmployeeStatus.ACTIVE);

        when(employeeRepository.findAll(any(Specification.class), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(e1, e2), PageRequest.of(0, 20), 2));
        when(paymentRepository.findPaidEmployeeIdsByPeriod(2026, 5, SalaryPaymentStatus.PAID))
                .thenReturn(List.of(e1.getId()));

        var paidPage = service.getPaymentStatus(2026, 5, PaymentStatusFilter.PAID, PageRequest.of(0, 20));
        var unpaidPage = service.getPaymentStatus(2026, 5, PaymentStatusFilter.UNPAID, PageRequest.of(0, 20));

        assertThat(paidPage.getContent()).hasSize(1);
        assertThat(paidPage.getContent().get(0).paymentStatus()).isEqualTo("PAID");
        assertThat(unpaidPage.getContent()).hasSize(1);
        assertThat(unpaidPage.getContent().get(0).paymentStatus()).isEqualTo("UNPAID");
    }
}
