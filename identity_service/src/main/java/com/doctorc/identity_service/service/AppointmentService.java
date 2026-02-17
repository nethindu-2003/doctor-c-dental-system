package com.doctorc.identity_service.service;

import com.doctorc.identity_service.dto.AppointmentRequest;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.DentistRepository;
import com.doctorc.identity_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private PatientRepository patientRepository;
    @Autowired private DentistRepository dentistRepository;
    @Autowired
    private com.doctorc.identity_service.repository.PaymentRepository paymentRepository;
    @Autowired
    private com.doctorc.identity_service.service.EmailService emailService;

    public List<LocalTime> getTakenSlots(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByAppointmentDateAndStatusNot(date, "CANCELLED");
        return appointments.stream().map(Appointment::getAppointmentTime).toList();
    }

    // 1. BOOK APPOINTMENT
    public Appointment bookAppointment(Integer patientId, AppointmentRequest request) {

        LocalDateTime appointmentDateTime = LocalDateTime.of(request.getDate(), request.getTime());
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book an appointment in the past.");
        }

        // A. Check if slot is taken
        boolean isTaken = appointmentRepository.existsByAppointmentDateAndAppointmentTimeAndStatusNot(
                request.getDate(), request.getTime(), "CANCELLED");

        if (isTaken) {
            throw new RuntimeException("This time slot is already booked. Please choose another.");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setReasonForVisit(request.getReasonForVisit());
        appointment.setAdditionalNotes(request.getAdditionalNotes());
        appointment.setAppointmentDate(request.getDate());
        appointment.setAppointmentTime(request.getTime());

        appointment.setStatus("CONFIRMED");

        // If user selected a dentist
        if (request.getDentistId() != null) {
            Dentist dentist = dentistRepository.findById(request.getDentistId())
                    .orElseThrow(() -> new RuntimeException("Dentist not found"));
            appointment.setDentist(dentist);
        }

        // 1. Save the appointment FIRST so it generates an ID
        Appointment savedAppointment = appointmentRepository.save(appointment);

        // 2. Create the Payment Record
        com.doctorc.identity_service.entity.Payment payment = new com.doctorc.identity_service.entity.Payment();
        payment.setPatient(patient);
        payment.setAppointment(savedAppointment); // Link to the new booking
        payment.setAmount(500.0); // The fixed booking fee
        payment.setPaymentType("BOOKING_FEE");
        payment.setStatus("COMPLETED"); // Simulated as paid
        payment.setPaymentDate(LocalDateTime.now());

        // 3. Save the Payment
        paymentRepository.save(payment);

        // --- NEW: SEND EMAIL CONFIRMATION ---
        // Check if patient has email notifications enabled (default is true, so we check if it's not explicitly false)
        if (patient.getEmailNotifications() != null && patient.getEmailNotifications()) {
            // Run email sending in a separate thread so the user doesn't wait for the email to send
            new Thread(() -> {
                emailService.sendBookingConfirmation(
                        patient.getEmail(),
                        patient.getName(),
                        savedAppointment.getAppointmentDate().toString(),
                        savedAppointment.getAppointmentTime().toString(),
                        savedAppointment.getReasonForVisit()
                );
            }).start();
        }

        // 4. Return the saved appointment to the controller
        return savedAppointment;
    }

    // 2. GET MY APPOINTMENTS
    public List<Appointment> getPatientAppointments(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return appointmentRepository.findByPatient(patient);
    }
}