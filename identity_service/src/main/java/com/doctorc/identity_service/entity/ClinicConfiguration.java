package com.doctorc.identity_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "clinic_configuration")
public class ClinicConfiguration {

    @Id
    @Column(name = "config_id")
    private Integer id = 1; // Locked to 1 for the singleton pattern

    @Column(name = "clinic_name")
    private String clinicName;

    @Column(name = "clinic_address")
    private String clinicAddress;

    @Column(name = "clinic_phone")
    private String clinicPhone;

    @Column(name = "clinic_email")
    private String clinicEmail;

    @Lob
    @Column(name = "clinic_logo", columnDefinition = "LONGTEXT")
    private String clinicLogo;

    @Column(name = "standard_booking_fee")
    private Double standardBookingFee;
}