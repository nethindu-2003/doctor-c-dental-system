package com.doctorc.identity_service.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

public class AdminReportDTO {

    @Data
    public static class PatientSummary {
        private Integer patientId; // Changed to Integer
        private String patientName;
        private String contactNumber;
        private Long totalAppointments;
        private LocalDate lastVisitDate;
        private Double totalSpent;
    }

    @Data
    public static class PatientFullReport {
        private Integer patientId; // Changed to Integer
        private String patientName;
        private String email;
        private String contactNumber;
        private String registeredDate;

        private List<AppointmentRecord> appointmentHistory;
        private List<PaymentRecord> paymentHistory;
    }

    @Data
    public static class AppointmentRecord {
        private Integer appointmentId; // Changed to Integer
        private LocalDate date;
        private String time;
        private String dentistName;
        private String status;
        private String treatmentDescription;
    }

    @Data
    public static class PaymentRecord {
        private Integer paymentId; // Changed to Integer
        private LocalDate paymentDate;
        private Double amount;
        private String status;
        private String description;
    }
}