package com.doctorc.identity_service.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.doctorc.identity_service.dto.AuthRequest;
import com.doctorc.identity_service.dto.AuthResponse;
import com.doctorc.identity_service.dto.DentistDTO;
import com.doctorc.identity_service.dto.ForgotPasswordRequest;
import com.doctorc.identity_service.dto.ResetPasswordRequest;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.repository.DentistRepository;
import com.doctorc.identity_service.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.doctorc.identity_service.repository.PatientRepository patientRepository;

    @Autowired
    private DentistRepository dentistRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // GET ALL DENTISTS (Public Endpoint)
    @GetMapping("/dentists")
    public List<DentistDTO> getAllDentists() {
        return dentistRepository.findAll().stream()
                .map(dentist -> new DentistDTO(dentist.getId(), dentist.getName(), dentist.getSpecialization(), dentist.getProfilePicture()))
                .collect(Collectors.toList());
    }

    @PostMapping("/register")
    public String register(@RequestBody Patient patient) {
        return authService.savePatient(patient);
    }

    @PostMapping("/login")
    public AuthResponse getToken(@RequestBody AuthRequest authRequest) {
        String token = authService.generateToken(
                authRequest.getEmail(),
                authRequest.getPassword(),
                authRequest.getRole()
        );
        return new AuthResponse(token);
    }

    @GetMapping("/verify-email")
    public String verifyEmail(@RequestParam("token") String token) {
        return authService.verifyEmail(token);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request.getEmail(), request.getRole());
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request.getToken(), request.getNewPassword());
    }

    @PostMapping("/admin/add-dentist")
    public String addDentist(@RequestBody Dentist dentist) {
        return authService.addDentist(dentist.getName(), dentist.getEmail(), dentist.getPhone(), dentist.getSpecialization());
    }

    @PostMapping("/setup-dentist")
    public String setupDentistPassword(@RequestBody ResetPasswordRequest request) {
        return authService.setupDentistPassword(request.getToken(), request.getNewPassword());
    }

    // --- SETUP PASSWORD FOR NEW PATIENTS ---
    @PostMapping("/patient/setup-password")
    public String setupPatientPassword(@RequestBody com.doctorc.identity_service.dto.SetupPasswordRequest request) {

        // 1. Find the patient by the token sent in the email
        com.doctorc.identity_service.entity.Patient patient = patientRepository.findByVerificationToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired setup token."));

        // 2. Encode the new password
        patient.setPassword(passwordEncoder.encode(request.getPassword()));

        // 3. Clear the token so the link cannot be used again
        patient.setVerificationToken(null);

        patientRepository.save(patient);

        return "Password successfully set. You can now log in.";
    }

}