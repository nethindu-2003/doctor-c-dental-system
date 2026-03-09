package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AdminAddPatientRequest {
    private String name;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dob;
}