package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.AdminAppointmentRequest;
import com.doctorc.identity_service.dto.AdminAppointmentResponse;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.DentistRepository;
import com.doctorc.identity_service.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth/admin/appointments")
public class AdminAppointmentController {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private DentistRepository dentistRepository;
    @Autowired private EmailService emailService;

    // 1. GET ALL APPOINTMENTS
    @GetMapping
    public List<AdminAppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll(Sort.by(Sort.Direction.DESC, "appointmentDate", "appointmentTime"))
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // 2. UPDATE APPOINTMENT
    @PutMapping("/{id}")
    public AdminAppointmentResponse updateAppointment(@PathVariable Integer id, @RequestBody AdminAppointmentRequest request) {
        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        validateModification(appt, request.getStatus());

        String oldDate = appt.getAppointmentDate().toString();
        String oldTime = appt.getAppointmentTime().toString();
        String oldStatus = appt.getStatus();
        boolean isRescheduled = !appt.getAppointmentDate().equals(request.getAppointmentDate()) ||
                !appt.getAppointmentTime().equals(request.getAppointmentTime());

        appt.setAppointmentDate(request.getAppointmentDate());
        appt.setAppointmentTime(request.getAppointmentTime());
        appt.setStatus(request.getStatus());

        if (request.getDentistId() != null) {
            Dentist dentist = dentistRepository.findById(request.getDentistId())
                    .orElseThrow(() -> new RuntimeException("Dentist not found"));
            appt.setDentist(dentist);
        } else {
            appt.setDentist(null);
        }

        Appointment savedAppt = appointmentRepository.save(appt);

        new Thread(() -> {
            if (appt.getPatient() != null && Boolean.TRUE.equals(appt.getPatient().getEmailNotifications())) {
                if (!"CANCELLED".equals(oldStatus) && "CANCELLED".equals(request.getStatus())) {
                    emailService.sendCancellationEmail(appt.getPatient().getEmail(), appt.getPatient().getName(), oldDate, oldTime);
                } else if (isRescheduled && !"CANCELLED".equals(request.getStatus())) {
                    emailService.sendRescheduleEmail(appt.getPatient().getEmail(), appt.getPatient().getName(),
                            oldDate, oldTime, request.getAppointmentDate().toString(), request.getAppointmentTime().toString());
                }
            }
        }).start();

        return mapToDTO(savedAppt);
    }

    // 3. QUICK CANCEL
    @PutMapping("/{id}/cancel")
    public AdminAppointmentResponse cancelAppointment(@PathVariable Integer id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Appointment not found"));

        validateModification(appt, "CANCELLED");

        String oldDate = appt.getAppointmentDate().toString();
        String oldTime = appt.getAppointmentTime().toString();

        appt.setStatus("CANCELLED");
        Appointment savedAppt = appointmentRepository.save(appt);

        new Thread(() -> {
            if (appt.getPatient() != null && Boolean.TRUE.equals(appt.getPatient().getEmailNotifications())) {
                emailService.sendCancellationEmail(appt.getPatient().getEmail(), appt.getPatient().getName(), oldDate, oldTime);
            }
        }).start();

        return mapToDTO(savedAppt);
    }

    // --- HELPER MAPPER ---
    private AdminAppointmentResponse mapToDTO(Appointment a) {
        AdminAppointmentResponse dto = new AdminAppointmentResponse();
        dto.setAppointmentId(a.getAppointmentId());
        if (a.getPatient() != null) {
            dto.setPatientId(a.getPatient().getId());
            dto.setPatientName(a.getPatient().getName());
        }
        if (a.getDentist() != null) {
            dto.setDentistId(a.getDentist().getId());
            dto.setDentistName(a.getDentist().getName());
        }
        dto.setReasonForVisit(a.getReasonForVisit());
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setAppointmentTime(a.getAppointmentTime());
        dto.setStatus(a.getStatus());
        return dto;
    }

    // Helper to prevent modifying the past (Strictly before Today)
    private void validateModification(Appointment appt, String targetStatus) {
        java.time.LocalDate today = java.time.LocalDate.now();
        if (appt.getAppointmentDate().isBefore(today)) {
            // Allow only marking as COMPLETED for past confirmed appointments
            if ("COMPLETED".equals(targetStatus) && "CONFIRMED".equals(appt.getStatus())) {
                return; // Authorization granted
            }
            throw new RuntimeException("Action denied: Cannot modify past appointments.");
        }
    }
}