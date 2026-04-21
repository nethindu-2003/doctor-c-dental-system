package com.doctorc.identity_service.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doctorc.identity_service.dto.DentistApptDTO;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.TreatmentSessionRepository;
import com.doctorc.identity_service.service.EmailService;

@RestController
@RequestMapping("/auth/dentist/appointments")
public class DentistAppointmentController {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private TreatmentSessionRepository treatmentSessionRepository;
    @Autowired private EmailService emailService;

    // 1. GET ALL APPOINTMENTS FOR LOGGED-IN DENTIST
    @GetMapping
    public List<DentistApptDTO> getMyAppointments(@RequestAttribute("id") Integer dentistId) {
        List<Appointment> appts = appointmentRepository.findByDentist_IdOrderByAppointmentDateAscAppointmentTimeAsc(dentistId);
        return appts.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // New: Get appointments for a specific patient (used in treatments session modal)
    @GetMapping("/patient/{patientId}")
    public List<DentistApptDTO> getPatientAppointments(@PathVariable Integer patientId) {
        List<Appointment> appts = appointmentRepository.findByPatient_Id(patientId);
        return appts.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // 2. CONFIRM APPOINTMENT
    @PutMapping("/{id}/confirm")
    public DentistApptDTO confirmAppointment(@PathVariable Integer id, @RequestAttribute("id") Integer dentistId) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Security check
        if (!appt.getDentist().getId().equals(dentistId)) throw new RuntimeException("Unauthorized");

        appt.setStatus("CONFIRMED");
        Appointment saved = appointmentRepository.save(appt);

        // Trigger Email
        if (appt.getPatient() != null) {
            new Thread(() -> {
                emailService.sendBookingConfirmation(
                        appt.getPatient().getEmail(),
                        appt.getPatient().getName(),
                        appt.getAppointmentDate().toString(),
                        appt.getAppointmentTime().toString(),
                        appt.getReasonForVisit()
                );
            }).start();
        }
        return mapToDTO(saved);
    }

    // 3. CANCEL APPOINTMENT
    @PutMapping("/{id}/cancel")
    public DentistApptDTO cancelAppointment(@PathVariable Integer id, @RequestAttribute("id") Integer dentistId) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appt.getDentist().getId().equals(dentistId)) throw new RuntimeException("Unauthorized");

        // Validate that appointment is in the future
        validateFutureAppointment(appt);

        appt.setStatus("CANCELLED");
        Appointment saved = appointmentRepository.save(appt);

        // Trigger Email
        if (appt.getPatient() != null) {
            new Thread(() -> {
                emailService.sendCancellationEmail(
                        appt.getPatient().getEmail(),
                        appt.getPatient().getName(),
                        appt.getAppointmentDate().toString(),
                        appt.getAppointmentTime().toString()
                );
            }).start();
        }
        return mapToDTO(saved);
    }

    private DentistApptDTO mapToDTO(Appointment a) {
        DentistApptDTO dto = new DentistApptDTO();
        dto.setAppointmentId(a.getAppointmentId());
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());   // ← populate patientId
            dto.setPatientName(a.getPatient().getName());
            dto.setPatientEmail(a.getPatient().getEmail());
            dto.setPatientPhone(a.getPatient().getPhone());
        }
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setAppointmentTime(a.getAppointmentTime());
        dto.setReasonForVisit(a.getReasonForVisit());
        dto.setAdditionalNotes(a.getAdditionalNotes());
        dto.setStatus(a.getStatus());
        dto.setCancelledByAdmin(a.getCancelledByAdmin());

        // Check if treatment already exists for this appointment
        treatmentSessionRepository.findFirstByAppointment_AppointmentId(a.getAppointmentId())
                .ifPresent(session -> dto.setTreatmentId(session.getTreatment().getTreatmentId()));

        return dto;
    }

    // Helper to prevent cancelling past appointments
    private void validateFutureAppointment(Appointment appt) {
        java.time.LocalDateTime apptDateTime = java.time.LocalDateTime.of(appt.getAppointmentDate(), appt.getAppointmentTime());
        if (apptDateTime.isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Action denied: Cannot cancel past appointments.");
        }
    }
}