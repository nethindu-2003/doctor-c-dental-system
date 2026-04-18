package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.TreatmentRequestDTO;
import com.doctorc.identity_service.entity.Treatment;
import com.doctorc.identity_service.entity.TreatmentSession;
import com.doctorc.identity_service.repository.TreatmentRepository;
import com.doctorc.identity_service.service.TreatmentManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/treatments")
public class TreatmentController {

    @Autowired
    private TreatmentManagementService treatmentService;

    @Autowired
    private TreatmentRepository treatmentRepository;

    // Get All Treatments (For Admin Financial Dashboard)
    @GetMapping("/all")
    public ResponseEntity<List<Treatment>> getAllTreatments() {
        return ResponseEntity.ok(treatmentRepository.findAll());
    }

    // Get Treatments (With Optional Patient Filter)
    @GetMapping("/dentist/{dentistId}")
    public ResponseEntity<List<Treatment>> getTreatments(
            @PathVariable Integer dentistId,
            @RequestParam String status,
            @RequestParam(required = false) Integer patientId) {

        if (patientId != null) {
            return ResponseEntity.ok(treatmentRepository.findByDentist_IdAndStatusAndPatient_IdOrderByStartDateDesc(dentistId, status, patientId));
        }
        return ResponseEntity.ok(treatmentRepository.findByDentist_IdAndStatusOrderByStartDateDesc(dentistId, status));
    }

    // Create Base Treatment
    @PostMapping
    public ResponseEntity<?> createTreatment(@RequestBody TreatmentRequestDTO.CreateTreatment request) {
        try {
            return ResponseEntity.ok(treatmentService.createTreatment(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Add Session to existing Treatment
    @PostMapping("/{treatmentId}/sessions")
    public ResponseEntity<?> addSession(@PathVariable Integer treatmentId, @RequestBody TreatmentRequestDTO.AddSession request) {
        try {
            return ResponseEntity.ok(treatmentService.addSessionToTreatment(treatmentId, request));
        } catch (Exception e) {
            // This will catch the "Insufficient stock" exception and alert the frontend!
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Mark Treatment as Complete
    @PutMapping("/{treatmentId}/complete")
    public ResponseEntity<Treatment> completeTreatment(@PathVariable Integer treatmentId) {
        return ResponseEntity.ok(treatmentService.completeTreatment(treatmentId));
    }
    @PutMapping("/{treatmentId}/reopen")
    public ResponseEntity<Treatment> reopenTreatment(@PathVariable Integer treatmentId) {
        return ResponseEntity.ok(treatmentService.reopenTreatment(treatmentId));
    }

    // Add extra session slots to an existing treatment
    @PostMapping("/{treatmentId}/add-sessions")
    public ResponseEntity<?> addMoreSessions(
            @PathVariable Integer treatmentId,
            @RequestParam Integer count) {
        try {
            if (count == null || count <= 0) {
                return ResponseEntity.badRequest().body("Count must be at least 1");
            }
            return ResponseEntity.ok(treatmentService.addMoreSessions(treatmentId, count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
