package pt.xavier.tms.shared.util;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

public final class DateUtils {

    private DateUtils() {
    }

    public static Instant nowUtc() {
        return Instant.now(Clock.systemUTC());
    }

    public static LocalDate todayUtc() {
        return LocalDate.now(ZoneOffset.UTC);
    }
}
