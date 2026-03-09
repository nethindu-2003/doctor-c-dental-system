package com.doctorc.identity_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "equipment")
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Integer equipmentId;

    private String name;
    private String category;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    private Integer threshold;

    @Column(name = "unit_cost")
    private Double unitCost;

    @Column(name = "last_updated")
    private LocalDate lastUpdated;

    @Column(name = "admin_id")
    private Integer adminId; // Tracks which admin last touched this
}