package com.doctorc.identity_service.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.doctorc.identity_service.entity.Admin;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.repository.AdminRepository;
import com.doctorc.identity_service.repository.DentistRepository;
import com.doctorc.identity_service.repository.PatientRepository;

@Service
public class AuthService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private DentistRepository dentistRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    // 1. REGISTER
    public String savePatient(Patient patient) {
        // Check if email exists
        if (patientRepository.existsByEmail(patient.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        // Hash Password
        patient.setPassword(passwordEncoder.encode(patient.getPassword()));

        // Generate Verification Token
        String token = UUID.randomUUID().toString();
        patient.setVerificationToken(token);
        patient.setVerified(false); // Default is false

        // Save to DB
        patientRepository.save(patient);

        // Send Email
        emailService.sendVerificationEmail(patient.getEmail(), token);

        return "Registration successful! Please check your email to verify.";
    }

    // 2. LOGIN
    public String generateToken(String email, String password, String role) {
        String dbPassword = "";
        boolean isVerified = false;
        Integer userId = null;
        String name = "";

        switch (role.toLowerCase()) {
            case "patient":
                Optional<Patient> patient = patientRepository.findByEmail(email);
                if (patient.isEmpty()) throw new RuntimeException("Patient not found");
                if (patient.get().getIsActive() == null || !patient.get().getIsActive()) {
                    throw new RuntimeException("Your account has been deactivated by the administrator.");
                }
                dbPassword = patient.get().getPassword();
                isVerified = patient.get().isVerified();
                userId = patient.get().getId();
                name = patient.get().getName();
                break;

            case "dentist":
                Optional<Dentist> dentist = dentistRepository.findByEmail(email);
                if (dentist.isEmpty()) throw new RuntimeException("Dentist not found");
                dbPassword = dentist.get().getPassword();
                isVerified = dentist.get().isVerified();
                userId = dentist.get().getId();
                name = dentist.get().getName();
                break;

            case "admin":
                Optional<Admin> admin = adminRepository.findByEmail(email);
                if (admin.isEmpty()) throw new RuntimeException("Admin not found");
                dbPassword = admin.get().getPassword();
                isVerified = true;
                userId = admin.get().getId();
                name = admin.get().getName();
                break;
        }

        if (!passwordEncoder.matches(password, dbPassword)) {
            throw new RuntimeException("Invalid Credentials");
        }
        if (role.equalsIgnoreCase("patient") && !isVerified) {
            throw new RuntimeException("Account not verified.");
        } else if (role.equalsIgnoreCase("dentist") && !isVerified) {
            throw new RuntimeException("Please check your email to set your password first.");
        }

        // Pass ID and Name to match Node.js Token
        return jwtService.generateToken(email, role.toLowerCase(), userId, name);
    }

    // 3. VERIFY EMAIL
    public String verifyEmail(String token) {
        Optional<Patient> patientOpt = patientRepository.findByVerificationToken(token);

        if (patientOpt.isEmpty()) {
            throw new RuntimeException("Invalid Token");
        }

        Patient patient = patientOpt.get();

        if (patient.isVerified()) {
            return "Email already verified. Login now.";
        }

        patient.setVerified(true);
        patient.setVerificationToken(null); // Clean up token
        patientRepository.save(patient);

        return "Email verified successfully!";
    }

    public String forgotPassword(String email, String role) {
        try {
            if (role == null || role.trim().isEmpty()) {
                throw new RuntimeException("Role must be provided (patient or dentist).");
            }

            String token = UUID.randomUUID().toString();
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(15);

            if (role.equalsIgnoreCase("patient")) {
                // 1. Explicitly check if the patient exists, throw an error if they don't
                Patient patient = patientRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("No patient account found with this email address."));

                patient.setResetToken(token);
                patient.setResetTokenExpiryDate(expiry);
                patientRepository.save(patient);

                emailService.sendPasswordResetEmail(email, token, role);
                return "Password reset link sent to your email.";

            } else if (role.equalsIgnoreCase("dentist")) {
                // 2. Explicitly check if the dentist exists, throw an error if they don't
                Dentist dentist = dentistRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("No dentist account found with this email address."));

                dentist.setResetToken(token);
                dentist.setResetTokenExpiryDate(expiry);
                dentistRepository.save(dentist);

                emailService.sendPasswordResetEmail(email, token, role);
                return "Password reset link sent to your email.";

            } else {
                throw new RuntimeException("Invalid role for password reset.");
            }

        } catch (Exception e) {
            // Print to console for debugging, but send the clean message back to React
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    public String resetPassword(String token, String newPassword) {
        // We don't know the role, so we check both tables
        Optional<Patient> patientOpt = patientRepository.findByResetToken(token);
        Optional<Dentist> dentistOpt = dentistRepository.findByResetToken(token);

        if (patientOpt.isPresent()) {
            Patient patient = patientOpt.get();
            validateToken(patient.getResetTokenExpiryDate());

            patient.setPassword(passwordEncoder.encode(newPassword)); // Hash it!
            patient.setResetToken(null); // Clear token
            patient.setResetTokenExpiryDate(null);
            patientRepository.save(patient);
            return "Password updated successfully.";

        } else if (dentistOpt.isPresent()) {
            Dentist dentist = dentistOpt.get();
            validateToken(dentist.getResetTokenExpiryDate());

            dentist.setPassword(passwordEncoder.encode(newPassword));
            dentist.setResetToken(null);
            dentist.setResetTokenExpiryDate(null);
            dentistRepository.save(dentist);
            return "Password updated successfully.";

        } else {
            throw new RuntimeException("Invalid or expired reset token.");
        }
    }

    private void validateToken(LocalDateTime expiryDate) {
        if (expiryDate.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token has expired. Please request a new one.");
        }
    }

    public String addDentist(String name, String email, String phone, String specialization) {
        if (dentistRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Dentist with this email already exists.");
        }

        Dentist dentist = new Dentist();
        dentist.setName(name);
        dentist.setEmail(email);
        dentist.setPhone(phone);
        dentist.setSpecialization(specialization);
        dentist.setPassword(null);
        dentist.setVerified(false);


        // Generate Invite Token
        String token = UUID.randomUUID().toString();
        dentist.setVerificationToken(token);

        dentistRepository.save(dentist);

        // Send Email (Update EmailService to support this HTML)
        emailService.sendDentistInviteEmail(email, name, token);

        return "Invitation sent to dentist successfully.";
    }

    public String setupDentistPassword(String token, String newPassword) {
        Optional<Dentist> dentistOpt = dentistRepository.findByVerificationToken(token);

        if (dentistOpt.isEmpty()) {
            throw new RuntimeException("Invalid or expired invitation link.");
        }

        Dentist dentist = dentistOpt.get();

        // Hash Password
        dentist.setPassword(passwordEncoder.encode(newPassword));
        dentist.setVerified(true);       // Activate Account
        dentist.setVerificationToken(null); // Clear Token

        dentistRepository.save(dentist);

        return "Password set successfully! You can now login.";
    }
}