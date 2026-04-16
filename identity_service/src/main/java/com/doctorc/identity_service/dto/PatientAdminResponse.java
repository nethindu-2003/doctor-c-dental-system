package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientAdminResponse {
    private Integer patientId;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
    private Boolean isActive;
    private String profilePicture;
}