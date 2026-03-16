package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.AdminReportDTO;
import com.doctorc.identity_service.service.AdminReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/admin/reports")
public class AdminReportController {

    @Autowired
    private AdminReportService reportService;

    @GetMapping("/summaries")
    public ResponseEntity<List<AdminReportDTO.PatientSummary>> getPatientSummaries() {
        return ResponseEntity.ok(reportService.getAllPatientSummaries());
    }

    // Changed path variable to Integer
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<AdminReportDTO.PatientFullReport> getPatientFullReport(@PathVariable Integer patientId) {
        return ResponseEntity.ok(reportService.getPatientFullReport(patientId));
    }
}