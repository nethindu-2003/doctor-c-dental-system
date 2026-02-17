package com.doctorc.identity_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@Table(name = "Treatment")
public class Treatment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "treatment_id")
    private Integer treatmentId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnore // Prevents loop: Patient -> Treatment -> Patient
    private Patient patient;

    @Column(name = "treatment_name")
    private String treatmentName; // e.g., "Root Canal"

    private String diagnosis;

    private String status; // IN_PROGRESS, COMPLETED

    @Column(name = "total_cost")
    private Double totalCost; // Total Estimated Cost of the whole plan

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // This fetches all sessions automatically when you load a Treatment
    @OneToMany(mappedBy = "treatment", cascade = CascadeType.ALL)
    private List<TreatmentSession> sessions;
}