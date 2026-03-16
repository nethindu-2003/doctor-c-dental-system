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

        return treatmentRepository.save(treatment);
    }

    // 2. Add a Session & Deduct Stock (TRANSACTIONAL IS CRITICAL HERE)
    @Transactional
    public TreatmentSession addSessionToTreatment(Integer treatmentId, TreatmentRequestDTO.AddSession req) {
        Treatment treatment = treatmentRepository.findById(treatmentId)
                .orElseThrow(() -> new RuntimeException("Treatment not found"));

        // A. Create & Save the Session
        TreatmentSession session = new TreatmentSession();
        session.setTreatment(treatment);
        session.setSessionName(req.getSessionName());
        session.setNote(req.getNote());
        session.setSessionDate(req.getSessionDate());
        session.setCost(req.getCost());
        session.setStatus(req.getStatus());
        if (req.getAppointmentId() != null) {
            Appointment appt = appointmentRepository.findById(req.getAppointmentId())
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
            session.setAppointment(appt);
        }
        session = sessionRepository.save(session);

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

        // C. Update the parent Treatment's total cost
        treatment.setTotalCost(treatment.getTotalCost() + req.getCost());
        treatmentRepository.save(treatment);

        return session;
    }

    // 3. Complete a Treatment
    public Treatment completeTreatment(Integer treatmentId) {
        Treatment treatment = treatmentRepository.findById(treatmentId).orElseThrow();
        treatment.setStatus("COMPLETED");
        treatment.setEndDate(LocalDate.now());
        return treatmentRepository.save(treatment);
    }
}