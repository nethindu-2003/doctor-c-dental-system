package com.doctorc.identity_service.service;

import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.TreatmentSession;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.TreatmentSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class NotificationScheduler {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private TreatmentSessionRepository treatmentSessionRepository;
    @Autowired private EmailService emailService;

    // Runs automatically every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
    @Scheduled(cron = "0 0 * * * *")
    public void sendAutomatedReminders() {
        send12HourAppointmentReminders();
        send24HourTreatmentReminders();
    }

    private void send12HourAppointmentReminders() {
        // Calculate date and time 12 hours from now
        LocalDate targetDate = LocalDate.now();
        LocalTime targetTime = LocalTime.now().plusHours(12).withMinute(0).withSecond(0).withNano(0);

        // If adding 12 hours pushes us to tomorrow
        if (LocalTime.now().plusHours(12).isBefore(LocalTime.now())) {
            targetDate = targetDate.plusDays(1);
        }

        // Fetch all appointments for that specific date
        // Note: In production, you'd write a specific SQL query, but filtering in Java is fine for now
        LocalDate finalTargetDate = targetDate;
        List<Appointment> upcomingAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "CONFIRMED".equals(a.getStatus()))
                .filter(a -> a.getAppointmentDate().equals(finalTargetDate))
                .filter(a -> a.getAppointmentTime().getHour() == targetTime.getHour())
                .filter(a -> a.getPatient().getEmailNotifications() != null && a.getPatient().getEmailNotifications())
                .toList();

        for (Appointment appt : upcomingAppointments) {
            emailService.sendAppointmentReminder(
                    appt.getPatient().getEmail(),
                    appt.getPatient().getName(),
                    appt.getAppointmentDate().toString(),
                    appt.getAppointmentTime().toString()
            );
        }
    }

    private void send24HourTreatmentReminders() {
        // Calculate date 24 hours from now (Tomorrow)
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<TreatmentSession> upcomingSessions = treatmentSessionRepository.findAll().stream()
                .filter(s -> "PENDING".equals(s.getStatus()))
                .filter(s -> s.getSessionDate() != null && s.getSessionDate().equals(tomorrow))
                .filter(s -> s.getTreatment().getPatient().getEmailNotifications() != null && s.getTreatment().getPatient().getEmailNotifications())
                .toList();

        for (TreatmentSession session : upcomingSessions) {
            // We use the linked appointment time if available, otherwise "TBD"
            String time = (session.getAppointment() != null) ? session.getAppointment().getAppointmentTime().toString() : "Time TBD";

            emailService.sendTreatmentReminder(
                    session.getTreatment().getPatient().getEmail(),
                    session.getTreatment().getPatient().getName(),
                    session.getSessionName(),
                    session.getSessionDate().toString(),
                    time
            );
        }
    }
}