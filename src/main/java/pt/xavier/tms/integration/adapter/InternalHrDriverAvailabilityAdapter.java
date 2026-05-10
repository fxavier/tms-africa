package pt.xavier.tms.integration.adapter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import pt.xavier.tms.integration.dto.DriverAvailabilityDto;
import pt.xavier.tms.integration.dto.RhAbsenceDto;
import pt.xavier.tms.integration.port.DriverAvailabilityPort;

@Component
public class InternalHrDriverAvailabilityAdapter implements DriverAvailabilityPort {

    @Override
    public DriverAvailabilityDto checkAvailability(UUID driverId, LocalDate startDate, LocalDate endDate) {
        return new DriverAvailabilityDto(driverId, true, "AVAILABLE", List.of(new RhAbsenceDto(startDate, endDate, "NONE")));
    }
}
