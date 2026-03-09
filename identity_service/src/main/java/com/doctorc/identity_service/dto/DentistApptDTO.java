package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DentistApptDTO {
    private Integer appointmentId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reasonForVisit;
    private String status;
}