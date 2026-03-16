package com.doctorc.identity_service.dto;
import lombok.Data;

@Data
public class DentistProfileDTO {
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String licenseId;
    private String bio;
    private String profilePicture;
}