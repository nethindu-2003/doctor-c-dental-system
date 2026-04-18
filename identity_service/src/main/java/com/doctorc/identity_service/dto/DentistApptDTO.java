package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DentistApptDTO {
    private Integer appointmentId;
    private Integer patientId;       // ← added: needed for "Add Treatment" navigation
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reasonForVisit;
    private String additionalNotes;
    private String status;
    private Integer treatmentId;

}