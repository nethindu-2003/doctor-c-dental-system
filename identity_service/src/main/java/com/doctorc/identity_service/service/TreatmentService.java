package com.doctorc.identity_service.service;

import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Treatment;
import com.doctorc.identity_service.repository.PatientRepository;
import com.doctorc.identity_service.repository.TreatmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TreatmentService {

    @Autowired
    private TreatmentRepository treatmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    // This method finds the Patient by ID, then gets their treatments
    public List<Treatment> getPatientTreatments(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // This relies on the custom method we added to TreatmentRepository
        return treatmentRepository.findByPatientOrderByStartDateDesc(patient);
    }
}