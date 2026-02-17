package com.doctorc.identity_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Patient")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Integer id;

    private String name;

    @Column(unique = true)
    private String email;

    private String phone;
    private String gender;
    private LocalDate dob;
    private String password;

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expires")
    private LocalDateTime resetTokenExpiryDate;

    @Column(name = "blood_group")
    private String bloodGroup;

    private String address;
    private String allergies;

    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;
}