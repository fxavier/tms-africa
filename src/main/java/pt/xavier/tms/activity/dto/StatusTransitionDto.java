package pt.xavier.tms.activity.dto;

import pt.xavier.tms.shared.enums.ActivityStatus;

public record StatusTransitionDto(
        ActivityStatus status,
        String notes
) {
}
