package com.doctorc.identity_service.dto;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String role; // "patient" or "dentist"
}