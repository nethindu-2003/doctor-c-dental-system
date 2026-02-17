package com.doctorc.identity_service.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    private String reasonForVisit;
    private String additionalNotes;
    private LocalDate date;
    private LocalTime time;
    private Integer dentistId; // Optional, user might select a specific doctor
}