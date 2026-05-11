package pt.xavier.tms.alert.dto;

public record AlertConfigurationUpdateDto(
        Integer daysBeforeWarning,
        Integer daysBeforeCritical,
        Boolean active
) {
}
