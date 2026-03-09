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
    @JsonIgnore
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "dentist_id")
    @JsonIgnore // Prevents looping issues when fetching dentists
    private Dentist dentist;

    @Column(name = "treatment_name")
    private String treatmentName;

    private String diagnosis;

    private String status;

    @Column(name = "total_cost")
    private Double totalCost;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "treatment", cascade = CascadeType.ALL)
    private List<TreatmentSession> sessions;
}