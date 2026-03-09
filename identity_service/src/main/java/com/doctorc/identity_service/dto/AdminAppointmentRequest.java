package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AdminAppointmentRequest {
    private Integer dentistId; // Can be null if changing to 'Any Dentist'
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
}