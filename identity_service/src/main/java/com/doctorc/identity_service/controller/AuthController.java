package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.AuthRequest;
import com.doctorc.identity_service.dto.AuthResponse;
import com.doctorc.identity_service.dto.ForgotPasswordRequest;
import com.doctorc.identity_service.dto.ResetPasswordRequest;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

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

}