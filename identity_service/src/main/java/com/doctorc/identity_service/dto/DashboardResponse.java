package com.doctorc.identity_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private int todaysAppointmentsCount;
    private List<PatientSummary> todaysPatients;
    private int completedTreatmentsCount;
    private List<TreatmentSummary> completedTreatments;
    private List<TreatmentSummary> ongoingTreatments;
    private List<NotificationSummary> notifications;

    @Data
    @AllArgsConstructor
    public static class PatientSummary {
        private Integer appointmentId;
        private Integer patientId;
        private String name;
        private LocalTime appointmentTime; // Using LocalTime based on your repo
        private String appointmentStatus;
    }

    @Data
    @AllArgsConstructor
    public static class TreatmentSummary {
        private Integer treatmentId;
        private String procedureName;
        private String patientName;
        private int progressPercentage;
        private LocalDate completionDate; // Will be null for ongoing
    }

    @Data
    @AllArgsConstructor
    public static class NotificationSummary {
        private Integer notificationId;
        private String title;
        private String message;
        private String type;
    }
}