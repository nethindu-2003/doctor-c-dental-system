package com.doctorc.identity_service.service;

import com.doctorc.identity_service.dto.DashboardResponse;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Equipment;
import com.doctorc.identity_service.entity.Treatment;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.EquipmentRepository;
import com.doctorc.identity_service.repository.TreatmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DentistDashboardService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public DashboardResponse getDashboardData(Integer dentistId) {
        LocalDate today = LocalDate.now();

        // 1. Fetch Today's Appointments
        int todaysAppointmentCount = appointmentRepository.countByDentist_IdAndAppointmentDate(dentistId, today);
        List<Appointment> todaysAppointments = appointmentRepository.findByDentist_IdAndAppointmentDateOrderByAppointmentTimeAsc(dentistId, today);

        List<DashboardResponse.PatientSummary> todaysPatients = todaysAppointments.stream()
                .map(appt -> new DashboardResponse.PatientSummary(
                        appt.getAppointmentId(),
                        appt.getPatient().getId(),
                        appt.getPatient().getName(),
                        appt.getAppointmentTime(),
                        appt.getStatus()
                ))
                .collect(Collectors.toList());

        // 2. Fetch Completed Treatments
        int completedTreatmentsCount = treatmentRepository.countByDentist_IdAndStatus(dentistId, "COMPLETED");
        List<Treatment> completedTreatmentsRaw = treatmentRepository.findByDentist_IdAndStatus(dentistId, "COMPLETED");

        List<DashboardResponse.TreatmentSummary> completedTreatments = completedTreatmentsRaw.stream()
                .map(t -> new DashboardResponse.TreatmentSummary(
                        t.getTreatmentId(),
                        t.getTreatmentName(),
                        t.getPatient().getName(),
                        100,
                        t.getEndDate()
                )).collect(Collectors.toList());

        // 3. Fetch Ongoing Treatments
        List<Treatment> ongoingTreatmentsRaw = treatmentRepository.findByDentist_IdAndStatus(dentistId, "ONGOING");

        List<DashboardResponse.TreatmentSummary> ongoingTreatments = ongoingTreatmentsRaw.stream()
                .map(t -> {
                    long completedCount = t.getSessions() != null ? t.getSessions().stream()
                            .filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()))
                            .count() : 0;
                    int progress = (t.getTotalSessionsPlanned() != null && t.getTotalSessionsPlanned() > 0)
                            ? (int) ((completedCount * 100) / t.getTotalSessionsPlanned())
                            : 0;
                    
                    return new DashboardResponse.TreatmentSummary(
                        t.getTreatmentId(),
                        t.getTreatmentName(),
                        t.getPatient().getName(),
                        progress,
                        null
                    );
                }).collect(Collectors.toList());

        // 4. Notifications (100% Dynamic)
        List<DashboardResponse.NotificationSummary> dynamicNotifications = new ArrayList<>();
        int notifIdCounter = 1;

        // A. Dynamic Appointment Reminders
        for (Appointment appt : todaysAppointments) {
            if (!"COMPLETED".equalsIgnoreCase(appt.getStatus()) && !"CANCELLED".equalsIgnoreCase(appt.getStatus())) {
                dynamicNotifications.add(new DashboardResponse.NotificationSummary(
                        notifIdCounter++,
                        "Upcoming Appointment",
                        "Patient " + appt.getPatient().getName() + " is scheduled at " + appt.getAppointmentTime(),
                        "REMINDER"
                ));
            }
        }

        // B. Dynamic Low Stock Alerts
        List<Equipment> lowStockItems = equipmentRepository.findLowStockEquipment();
        for (Equipment item : lowStockItems) {
            dynamicNotifications.add(new DashboardResponse.NotificationSummary(
                    notifIdCounter++,
                    "Low Stock Alert: " + item.getName(),
                    "Only " + item.getStockQuantity() + " left. (Threshold: " + item.getThreshold() + ")",
                    "ALERT"
            ));
        }

        // 5. Build and return the final response
        return new DashboardResponse(
                todaysAppointmentCount,
                todaysPatients,
                completedTreatmentsCount,
                completedTreatments,
                ongoingTreatments,
                dynamicNotifications
        );
    }
}