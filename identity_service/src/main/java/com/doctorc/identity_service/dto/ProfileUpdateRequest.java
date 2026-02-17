package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    private String name;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String bloodGroup;
    private String address;
    private String allergies;
    private Boolean emailNotifications;
}