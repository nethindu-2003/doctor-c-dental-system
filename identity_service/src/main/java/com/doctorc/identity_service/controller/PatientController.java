package com.doctorc.identity_service.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.doctorc.identity_service.dto.AppointmentRequest;
import com.doctorc.identity_service.dto.DentistDTO;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Treatment;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.DentistRepository;
import com.doctorc.identity_service.service.AppointmentService;
import com.doctorc.identity_service.service.TreatmentService;

@RestController
@RequestMapping("/auth/patient")
public class PatientController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DentistRepository dentistRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private TreatmentService treatmentService;

    @Autowired
    private com.doctorc.identity_service.repository.TreatmentRepository treatmentRepository;
    @Autowired
    private com.doctorc.identity_service.repository.PatientRepository patientRepository;
    @Autowired
    private com.doctorc.identity_service.service.PaymentService paymentService;
    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // 1. BOOK APPOINTMENT
    @PostMapping("/appointments")
    public Appointment bookAppointment(@RequestBody AppointmentRequest request,
                                       @RequestAttribute("id") Integer patientId) {
        // Note: "id" comes from the JWT Filter we created earlier!
        // We will need to make sure our Filter passes this attribute.
        return appointmentService.bookAppointment(patientId, request);
    }

    // 2. VIEW MY APPOINTMENTS
    @GetMapping("/appointments")
    public List<Appointment> getMyAppointments(@RequestAttribute("id") Integer patientId) {
        return appointmentService.getPatientAppointments(patientId);
    }

    // 3. GET TAKEN SLOTS
    @GetMapping("/appointments/slots")
    public List<LocalTime> getTakenSlots(@RequestParam("date") LocalDate date) {
        return appointmentService.getTakenSlots(date);
    }

    // 4. GET ALL DENTISTS (For Booking Dropdown)
    @GetMapping("/dentists")
    public List<DentistDTO> getAllDentists() {
        return dentistRepository.findAll().stream()
                .map(dentist -> new DentistDTO(
                        dentist.getId(),
                        dentist.getName(),
                        dentist.getSpecialization(),
                        dentist.getProfilePicture()
                ))
                .collect(Collectors.toList());
    }

    // 5. CANCEL APPOINTMENT
    @PutMapping("/appointments/{id}/cancel")
    public String cancelAppointment(@PathVariable Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // Logic: Only allow cancelling if it's PENDING or CONFIRMED
        if ("PENDING".equals(appointment.getStatus()) || "CONFIRMED".equals(appointment.getStatus())) {
            // Check if appointment is within 1 hour
            java.time.LocalDateTime apptDateTime = java.time.LocalDateTime.of(
                    appointment.getAppointmentDate(), 
                    appointment.getAppointmentTime()
            );
            if (apptDateTime.isBefore(java.time.LocalDateTime.now().plusHours(1))) {
                throw new RuntimeException("Cannot cancel appointments within 1 hour of scheduled time.");
            }
            
            appointment.setStatus("CANCELLED");
            appointmentRepository.save(appointment);
            return "Appointment cancelled successfully.";
        } else {
            throw new RuntimeException("Cannot cancel this appointment.");
        }
    }

    // 6. GET MY TREATMENTS
    @GetMapping("/treatments")
    public List<Treatment> getMyTreatments(@RequestAttribute("id") Integer patientId) {
        // The Service now handles finding the patient, so Controller stays clean
        return treatmentService.getPatientTreatments(patientId);
    }

    // 7. GET PAYMENT HISTORY
    @GetMapping("/payments")
    public List<com.doctorc.identity_service.entity.Payment> getMyPayments(@RequestAttribute("id") Integer patientId) {
        return paymentService.getPatientPaymentHistory(patientId);
    }

    // 8. GET PROFILE
    @GetMapping("/profile")
    public Patient getMyProfile(@RequestAttribute("id") Integer patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // 9. UPDATE PROFILE
    @PutMapping("/profile")
    public Patient updateProfile(@RequestAttribute("id") Integer patientId,
                                 @RequestBody com.doctorc.identity_service.dto.ProfileUpdateRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        patient.setName(request.getName());
        patient.setDob(request.getDob());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setAllergies(request.getAllergies());
        patient.setEmailNotifications(request.getEmailNotifications());
        if (request.getProfilePicture() != null) {
            patient.setProfilePicture(request.getProfilePicture());
        }

        return patientRepository.save(patient);
    }

    // 10. CHANGE PASSWORD
    @PutMapping("/password")
    public String changePassword(@RequestAttribute("id") Integer patientId,
                                 @RequestBody com.doctorc.identity_service.dto.PasswordChangeRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Validate Current Password
        if (!passwordEncoder.matches(request.getCurrentPassword(), patient.getPassword())) {
            throw new RuntimeException("Incorrect current password.");
        }

        // Validate New Password (Basic Length Check)
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters.");
        }

        // Encode and Save New Password
        patient.setPassword(passwordEncoder.encode(request.getNewPassword()));
        patientRepository.save(patient);

        return "Password updated successfully.";
    }
}