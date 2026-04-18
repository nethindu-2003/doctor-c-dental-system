package com.doctorc.identity_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "Payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    // Directly link to Patient for easy history fetching
    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnore
    private Patient patient;

    // For Booking Fees
    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    // For Treatment Payments
    @ManyToOne
    @JoinColumn(name = "treatment_id")
    @JsonIgnore // Prevent loop: Treatment -> Payment -> Treatment
    private Treatment treatment;

    @ManyToOne
    @JoinColumn(name = "session_id")
    @JsonIgnore
    private TreatmentSession session;

    private Double amount;

    @Column(name = "payment_type")
    private String paymentType; // e.g., "BOOKING_FEE", "TREATMENT_PAYMENT"

    private String status; // e.g., "COMPLETED", "FAILED"

    @Column(name = "payment_date")
    private LocalDateTime paymentDate = LocalDateTime.now();
}