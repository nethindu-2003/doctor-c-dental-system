package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.DashboardResponse;
import com.doctorc.identity_service.service.DentistDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/dentist")
public class DentistDashboardController {

    @Autowired
    private DentistDashboardService dashboardService;

    @GetMapping("/{dentistId}/dashboard")
    public ResponseEntity<DashboardResponse> getDashboardData(@PathVariable Integer dentistId) {
        DashboardResponse data = dashboardService.getDashboardData(dentistId);
        return ResponseEntity.ok(data);
    }
}