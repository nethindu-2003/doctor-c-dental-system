package com.doctorc.identity_service.dto;
import java.time.LocalDate;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private LocalDate dob;
    private String gender;
    private String phone;
    private String bloodGroup;
    private String address;
    private String allergies;
    private String profilePicture;
    private Boolean emailNotifications;
}