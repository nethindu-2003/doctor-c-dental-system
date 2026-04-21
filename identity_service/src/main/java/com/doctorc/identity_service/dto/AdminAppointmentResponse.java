package com.doctorc.identity_service.dto;
import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

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
    private Boolean cancelledByAdmin;
}