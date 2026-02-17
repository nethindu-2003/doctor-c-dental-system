package com.doctorc.identity_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Integer appointmentId;

    // Link to Patient
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore // Prevents infinite loop when fetching Patient -> Appointment -> Patient
    private Patient patient;

    // Link to Dentist
    @ManyToOne
    @JoinColumn(name = "dentist_id")
    @JsonIgnore // Prevents infinite loop
    private Dentist dentist;

    @Column(name = "reason_for_visit", nullable = false)
    private String reasonForVisit;

    @Column(name = "additional_notes")
    private String additionalNotes;

    @Column(name = "appointment_date")
    private LocalDate appointmentDate;

    @Column(name = "appointment_time")
    private LocalTime appointmentTime;

    // PENDING, CONFIRMED, COMPLETED, CANCELLED
    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}