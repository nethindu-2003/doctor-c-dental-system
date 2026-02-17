package com.doctorc.identity_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "treatment_session")
public class TreatmentSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @ManyToOne
    @JoinColumn(name = "treatment_id")
    @JsonIgnore // Prevents loop: Treatment -> Session -> Treatment
    private Treatment treatment;

    // --- NEW LINK ---
    // Links this session to the calendar.
    // If null, it means the session is planned but not yet scheduled.
    @OneToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(name = "session_name")
    private String sessionName; // e.g., "Pulp Removal"

    private String note;

    @Column(name = "session_date")
    private LocalDate sessionDate;

    private String status; // PENDING, COMPLETED

    private Double cost; // Cost for THIS specific session

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void setLastUpdate() {  this.updatedAt = LocalDateTime.now(); }
}