package pt.xavier.tms.shared.util;

import java.time.Year;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

@Component
public class CodeGenerator {

    private final AtomicInteger sequence = new AtomicInteger(0);

    public synchronized String nextActivityCode() {
        int next = sequence.incrementAndGet();
        return "ACT-%d-%04d".formatted(Year.now().getValue(), next);
    }
}
