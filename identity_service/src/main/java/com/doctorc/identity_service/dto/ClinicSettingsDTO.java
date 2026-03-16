package com.doctorc.identity_service.dto;

import lombok.Data;
import java.time.LocalTime;
import java.util.List;

@Data
public class ClinicSettingsDTO {

    // Config Fields
    private String clinicName;
    private String clinicAddress;
    private String clinicPhone;
    private String clinicEmail;
    private String clinicLogo;
    private Double standardBookingFee;

    // Schedule Fields
    private List<ScheduleDTO> schedules;

    @Data
    public static class ScheduleDTO {
        private String dayOfWeek;
        private LocalTime openTime;
        private LocalTime closeTime;
        private Boolean isClosed;
    }
}