package pt.xavier.tms.shared.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Year;
import org.junit.jupiter.api.Test;

class CodeGeneratorTest {

    private final CodeGenerator codeGenerator = new CodeGenerator();

    @Test
    void shouldGenerateActivityCodeInExpectedFormat() {
        String code = codeGenerator.nextActivityCode();
        assertThat(code).matches("ACT-%d-\\d{4}".formatted(Year.now().getValue()));
    }
}
