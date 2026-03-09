package com.doctorc.identity_service.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Dentist") // Matches your DB table
public class Dentist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dentist_id")
    @JsonProperty("dentistId")
    private Integer id;

    private String name;

    @Column(unique = true)
    private String email;

    private String phone;
    private String specialization;
    private String password;

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expires")
    private LocalDateTime resetTokenExpiryDate;

    @Column(name = "license_id")
    private String licenseId;

    @Column(columnDefinition = "TEXT")
    private String bio;
}