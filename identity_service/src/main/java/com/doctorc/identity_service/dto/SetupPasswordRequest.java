package com.doctorc.identity_service.dto;
import lombok.Data;

@Data
public class SetupPasswordRequest {
    private String token;
    private String password;
}