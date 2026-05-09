package pt.xavier.tms;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModulithStructureTest {

    @Test
    void shouldVerifyApplicationModules() {
        ApplicationModules.of(TmsApplication.class).verify();
    }
}
