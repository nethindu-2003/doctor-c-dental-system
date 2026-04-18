package com.doctorc.identity_service.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

public class TreatmentRequestDTO {

    @Data
    public static class CreateTreatment {
        private Integer patientId;
        private Integer dentistId;
        private String treatmentName;
        private String diagnosis;
        private LocalDate startDate;
        private Double totalCost; // Initial cost, if any
        private Integer totalSessionsPlanned;
        private Integer appointmentId; // Optional: link sessions to this appointment
    }

    @Data
    public static class AddSession {
        private Integer sessionId; // Added to support updating existing rows
        private Integer appointmentId; // Optional
        private String sessionName;
        private String note;
        private LocalDate sessionDate;
        private LocalDate nextDate;
        private Double cost;
        private String status;
        private List<EquipmentUsage> equipmentUsed; // The equipment used in this session
    }

    @Data
    public static class EquipmentUsage {
        private Integer equipmentId;
        private Integer quantity;
    }
}