package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AdminAppointmentResponse {
    private Integer appointmentId;
    private Integer patientId;
    private String patientName;
    private Integer dentistId;
    private String dentistName;
    private String reasonForVisit;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
}