package com.doctorc.identity_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Entity
@Data
@Table(name = "clinic_schedule")
public class ClinicSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "day_of_week", unique = true)
    private String dayOfWeek; // e.g., "MONDAY", "TUESDAY"

    @Column(name = "open_time")
    private LocalTime openTime; // e.g., 09:00

    @Column(name = "close_time")
    private LocalTime closeTime; // e.g., 17:00

    @Column(name = "is_closed")
    private Boolean isClosed = false; // To easily mark Sundays or Holidays as closed
}