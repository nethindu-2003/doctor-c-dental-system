package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.DentistPatientRowDTO;
import com.doctorc.identity_service.dto.TreatmentHistoryDTO;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Treatment;
import com.doctorc.identity_service.entity.TreatmentSession;
import com.doctorc.identity_service.repository.PatientRepository;
import com.doctorc.identity_service.repository.TreatmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth/dentist/patients")
public class DentistPatientController {

    @Autowired private PatientRepository patientRepository;
    @Autowired private TreatmentRepository treatmentRepository;

    // Notice: We deleted the TreatmentSessionRepository because your @OneToMany handles it automatically!

    // 1. GET ALL PATIENTS FOR TABLE
    @GetMapping
    public List<DentistPatientRowDTO> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();

        return patients.stream().map(patient -> {
            DentistPatientRowDTO dto = new DentistPatientRowDTO();
            // Adjust to patient.getPatientId() if your Patient entity uses that instead of getId()
            dto.setPatientId(patient.getId());
            dto.setName(patient.getName());
            dto.setEmail(patient.getEmail());
            dto.setPhone(patient.getPhone());

            // FIX: Using your exact repository method by passing the 'patient' object!
            List<Treatment> treatments = treatmentRepository.findByPatientOrderByStartDateDesc(patient);

            if (!treatments.isEmpty()) {
                Treatment latestTreatment = treatments.get(0);
                dto.setCurrentTreatment(latestTreatment.getTreatmentName());

                // FIX: Grab the sessions directly from the Treatment entity
                List<TreatmentSession> sessions = latestTreatment.getSessions();
                if (sessions != null && !sessions.isEmpty()) {
                    // Get the date of the most recent session
                    TreatmentSession lastSession = sessions.get(sessions.size() - 1);
                    dto.setLastVisit(lastSession.getSessionDate() != null ? lastSession.getSessionDate().toString() : "Unknown");
                } else {
                    dto.setLastVisit("No Sessions Yet");
                }
            } else {
                dto.setCurrentTreatment("No Active Treatment");
                dto.setLastVisit("Never");
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // 2. GET FULL HISTORY FOR MODAL
    @GetMapping("/{id}/history")
    public List<TreatmentHistoryDTO> getPatientHistory(@PathVariable Integer id) {

        // FIX: Find the patient first, so we can pass it to your repository
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        List<Treatment> treatments = treatmentRepository.findByPatientOrderByStartDateDesc(patient);

        return treatments.stream().map(t -> {
            TreatmentHistoryDTO dto = new TreatmentHistoryDTO();
            dto.setTreatmentId(t.getTreatmentId());
            dto.setTreatmentName(t.getTreatmentName());
            dto.setStatus(t.getStatus());

            // Safe check for dentist name
            dto.setDentistName(t.getDentist() != null ? t.getDentist().getName() : "Unassigned");

            // FIX: Map the @OneToMany sessions directly to the DTO
            if (t.getSessions() != null) {
                List<TreatmentHistoryDTO.SessionDTO> sessionDTOs = t.getSessions().stream()
                        .map(s -> {
                            TreatmentHistoryDTO.SessionDTO sDto = new TreatmentHistoryDTO.SessionDTO();
                            sDto.setSessionDate(s.getSessionDate() != null ? s.getSessionDate().toString() : "Unknown Date");
                            sDto.setNotes(s.getNote() != null ? s.getNote() : "");
                            return sDto;
                        }).collect(Collectors.toList());
                dto.setSessions(sessionDTOs);
            }

            return dto;
        }).collect(Collectors.toList());
    }
}