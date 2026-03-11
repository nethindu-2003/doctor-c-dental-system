package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    // Find all appointments for a specific patient
    List<Appointment> findByPatient(Patient patient);

    boolean existsByAppointmentDateAndAppointmentTimeAndStatusNot(LocalDate date, LocalTime time, String status);

    // Get all taken slots for a specific date
    List<Appointment> findByAppointmentDateAndStatusNot(LocalDate date, String status);

    // Fetch all appointments for a specific dentist
    List<Appointment> findByDentist_IdOrderByAppointmentDateAscAppointmentTimeAsc(Integer dentistId);

    // Get today's appointments for a specific dentist
    List<Appointment> findByDentist_IdAndAppointmentDateOrderByAppointmentTimeAsc(Integer dentistId, LocalDate date);

    // Count today's appointments
    int countByDentist_IdAndAppointmentDate(Integer dentistId, LocalDate date);
}