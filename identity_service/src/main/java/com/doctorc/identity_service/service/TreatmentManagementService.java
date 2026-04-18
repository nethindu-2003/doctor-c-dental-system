package com.doctorc.identity_service.service;

import com.doctorc.identity_service.dto.TreatmentRequestDTO;
import com.doctorc.identity_service.entity.*;
import com.doctorc.identity_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TreatmentManagementService {

    @Autowired private TreatmentRepository treatmentRepository;
    @Autowired private TreatmentSessionRepository sessionRepository;
    @Autowired private TreatmentEquipmentRepository treatmentEquipmentRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private PatientRepository patientRepository; // Assuming you have this
    @Autowired private DentistRepository dentistRepository; // Assuming you have this
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private EmailService emailService;
    @Autowired private PaymentRepository paymentRepository;

    // 1. Create a New Base Treatment
    public Treatment createTreatment(TreatmentRequestDTO.CreateTreatment req) {
        Treatment treatment = new Treatment();
        treatment.setPatient(patientRepository.findById(req.getPatientId()).orElseThrow());
        treatment.setDentist(dentistRepository.findById(req.getDentistId()).orElseThrow());
        treatment.setTreatmentName(req.getTreatmentName());
        treatment.setDiagnosis(req.getDiagnosis());
        treatment.setStartDate(req.getStartDate());
        treatment.setTotalCost(req.getTotalCost() != null ? req.getTotalCost() : 0.0);

        treatment.setTotalSessionsPlanned(req.getTotalSessionsPlanned() != null ? req.getTotalSessionsPlanned() : 1);
        treatment.setStatus("ONGOING");
        
        Treatment savedTreatment = treatmentRepository.save(treatment);

        // Get appointment if provided
        Appointment appointment = null;
        if (req.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(req.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
        }

        // Pre-create empty session slots
        for (int i = 1; i <= savedTreatment.getTotalSessionsPlanned(); i++) {
            TreatmentSession session = new TreatmentSession();
            session.setTreatment(savedTreatment);
            session.setSessionName("Session #" + i);
            session.setStatus("PLANNED"); // Initial status
            session.setSessionDate(null); // No date yet
            if (appointment != null) {
                session.setAppointment(appointment);
            }
            sessionRepository.save(session);
        }

        return savedTreatment;
    }

    // 2. Add a Session & Deduct Stock (TRANSACTIONAL IS CRITICAL HERE)
    @Transactional
    public TreatmentSession addSessionToTreatment(Integer treatmentId, TreatmentRequestDTO.AddSession req) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        // A. Create OR Fetch the Session (to support pre-created rows)
        TreatmentSession session;
        if (req.getSessionId() != null) {
            session = sessionRepository.findById(req.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session slot not found"));
        } else {
            session = new TreatmentSession();
            session.setTreatment(treatment);
        }

        session.setSessionName(req.getSessionName());
        session.setNote(req.getNote());
        session.setSessionDate(req.getSessionDate());
        session.setNextDate(req.getNextDate());
        session.setCost(req.getCost());
        session.setStatus(req.getStatus());

        if (req.getAppointmentId() != null) {
            Appointment appt = appointmentRepository.findById(req.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
            session.setAppointment(appt);
        }
        session = sessionRepository.save(session);

        // EXTRA: Automate Next Session Scheduling
        if (session.getNextDate() != null) {
            // Find the next session in the sequence for this treatment
            List<TreatmentSession> allSessions = sessionRepository.findAllByTreatmentOrderBySessionIdAsc(treatment);
            int currentIndex = allSessions.indexOf(session);
            if (currentIndex >= 0 && currentIndex < allSessions.size() - 1) {
                TreatmentSession nextSession = allSessions.get(currentIndex + 1);
                // Only update if the next session hasn't been completed yet
                if (!"COMPLETED".equals(nextSession.getStatus())) {
                    nextSession.setSessionDate(session.getNextDate());
                    sessionRepository.save(nextSession);
                }
            }

            if (treatment.getPatient() != null) {
                final String email = treatment.getPatient().getEmail();
                final String name = treatment.getPatient().getName();
                final String tName = treatment.getTreatmentName();
                final String nDate = session.getNextDate().toString();
                new Thread(() -> {
                    emailService.sendNextSessionScheduled(email, name, tName, nDate);
                }).start();
            }
        }

        // NEW: Log a Payment entry for this session cost
        if (session.getCost() != null && session.getCost() > 0) {
            Payment payment = new Payment();
            payment.setPatient(treatment.getPatient());
            payment.setTreatment(treatment);
            payment.setSession(session);
            // payment.setAppointment(session.getAppointment()); // REDUNDANT: Removed to bypass DB unique constraint on appointment_id
            payment.setAmount(session.getCost());
            payment.setPaymentType("TREATMENT_PAYMENT");
            payment.setStatus("COMPLETED"); // Payment is assumed collected at the session visit
            paymentRepository.save(payment);
        }

        // B. Process Equipment and Deduct Stock
        if (req.getEquipmentUsed() != null && !req.getEquipmentUsed().isEmpty()) {
            for (TreatmentRequestDTO.EquipmentUsage usage : req.getEquipmentUsed()) {
                Equipment equipment = equipmentRepository.findById(usage.getEquipmentId())
                        .orElseThrow(() -> new RuntimeException("Equipment not found"));

                // Check stock
                if (equipment.getStockQuantity() < usage.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for " + equipment.getName());
                }

                // Deduct stock and save
                equipment.setStockQuantity(equipment.getStockQuantity() - usage.getQuantity());
                equipment.setLastUpdated(LocalDate.now());
                equipmentRepository.save(equipment);

                // Record the usage mapping
                TreatmentEquipment te = new TreatmentEquipment();
                te.setSession(session);
                te.setEquipment(equipment);
                te.setQuantityUsed(usage.getQuantity());
                treatmentEquipmentRepository.save(te);
            }
        }

        return session;
    }

    // 3. Complete a Treatment
    public Treatment completeTreatment(Integer treatmentId) {
        Treatment treatment = treatmentRepository.findById(treatmentId).orElseThrow();
        treatment.setStatus("COMPLETED");
        treatment.setEndDate(LocalDate.now());
        return treatmentRepository.save(treatment);
    }

    public Treatment reopenTreatment(Integer treatmentId) {
        Treatment treatment = treatmentRepository.findById(treatmentId).orElseThrow();
        treatment.setStatus("ONGOING");
        treatment.setEndDate(null);
        return treatmentRepository.save(treatment);
    }

    // 4. Add More Session Slots to an Existing Treatment
    public Treatment addMoreSessions(Integer treatmentId, Integer count) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        // Count existing sessions to continue numbering correctly
        List<TreatmentSession> existingSessions =
                sessionRepository.findAllByTreatmentOrderBySessionIdAsc(treatment);
        int existingCount = existingSessions.size();

        // Append new empty PLANNED slots
        for (int i = 1; i <= count; i++) {
            TreatmentSession session = new TreatmentSession();
            session.setTreatment(treatment);
            session.setSessionName("Session #" + (existingCount + i));
            session.setStatus("PLANNED");
            session.setSessionDate(null);
            sessionRepository.save(session);
        }

        // Keep totalSessionsPlanned in sync
        treatment.setTotalSessionsPlanned(existingCount + count);
        return treatmentRepository.save(treatment);
    }
}
