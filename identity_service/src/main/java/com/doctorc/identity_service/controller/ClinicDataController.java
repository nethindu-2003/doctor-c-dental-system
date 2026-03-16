package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.entity.Equipment;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.repository.EquipmentRepository;
import com.doctorc.identity_service.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class ClinicDataController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    // Endpoint for the Patient Dropdown
    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    // Endpoint for the Equipment Dropdown
    @GetMapping("/equipment")
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        return ResponseEntity.ok(equipmentRepository.findAll());
    }
}