package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.AdminAddPatientRequest;
import com.doctorc.identity_service.dto.PatientAdminResponse;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.repository.PatientRepository;
import com.doctorc.identity_service.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth/admin")
public class AdminController {

    @Autowired private PatientRepository patientRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;

    // 1. GET ALL PATIENTS
    @GetMapping("/patients")
    public List<PatientAdminResponse> getAllPatients() {
        return patientRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // 2. ADD NEW PATIENT (Walk-in / Admin Registration)
    @PostMapping("/patients")
    public PatientAdminResponse addPatient(@RequestBody AdminAddPatientRequest request) {
        if (patientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered.");
        }

        Patient patient = new Patient();
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setGender(request.getGender());
        patient.setDob(request.getDob());

        // DO NOT set a password. It will remain null/empty until they set it via the email link.
        //patient.setRole("PATIENT");
        patient.setIsActive(true);

        // Generate the secure token for the email link
        String token = UUID.randomUUID().toString();
        patient.setVerificationToken(token);

        Patient savedPatient = patientRepository.save(patient);

        // Trigger Invitation Email
        new Thread(() -> {
            emailService.sendPatientInviteEmail(savedPatient.getEmail(), savedPatient.getName(), token);
        }).start();

        return mapToDTO(savedPatient);
    }

    // 3. TOGGLE PATIENT STATUS (Active/Inactive)
    @PutMapping("/patients/{id}/status")
    public PatientAdminResponse togglePatientStatus(@PathVariable Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Toggle the boolean
        patient.setIsActive(patient.getIsActive() == null || !patient.getIsActive());
        return mapToDTO(patientRepository.save(patient));
    }

    // 4. DELETE PATIENT
    @DeleteMapping("/patients/{id}")
    public String deletePatient(@PathVariable Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.delete(patient);
        return "Patient deleted successfully.";
    }

    // Helper Mapper
    private PatientAdminResponse mapToDTO(Patient p) {
        PatientAdminResponse dto = new PatientAdminResponse();
        dto.setPatientId(p.getId());
        dto.setName(p.getName());
        dto.setEmail(p.getEmail());
        dto.setPhone(p.getPhone());
        dto.setGender(p.getGender());
        dto.setDob(p.getDob());
        dto.setIsActive(p.getIsActive() != null ? p.getIsActive() : true);
        dto.setProfilePicture(p.getProfilePicture());
        return dto;
    }
}