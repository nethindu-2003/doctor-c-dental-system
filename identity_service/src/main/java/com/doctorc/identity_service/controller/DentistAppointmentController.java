package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.DentistApptDTO;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth/dentist/appointments")
public class DentistAppointmentController {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private EmailService emailService;

    // 1. GET ALL APPOINTMENTS FOR LOGGED-IN DENTIST
    @GetMapping
    public List<DentistApptDTO> getMyAppointments(@RequestAttribute("id") Integer dentistId) {
        List<Appointment> appts = appointmentRepository.findByDentist_IdOrderByAppointmentDateAscAppointmentTimeAsc(dentistId);
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
        dto.setAppointmentId(a.getAppointmentId()); // Adjust if your entity uses getId()
        if (a.getPatient() != null) {
            dto.setPatientName(a.getPatient().getName());
            dto.setPatientEmail(a.getPatient().getEmail());
            dto.setPatientPhone(a.getPatient().getPhone());
        }
        dto.setAppointmentDate(a.getAppointmentDate());
        dto.setAppointmentTime(a.getAppointmentTime());
        dto.setReasonForVisit(a.getReasonForVisit());
        dto.setStatus(a.getStatus());
        return dto;
    }
}