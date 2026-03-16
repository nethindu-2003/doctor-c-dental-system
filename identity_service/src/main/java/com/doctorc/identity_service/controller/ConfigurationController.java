package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.ClinicSettingsDTO;
import com.doctorc.identity_service.service.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/admin/settings")
public class ConfigurationController {

    @Autowired
    private ConfigurationService configurationService;

    // GET /admin/settings
    @GetMapping
    public ResponseEntity<ClinicSettingsDTO> getSettings() {
        return ResponseEntity.ok(configurationService.getClinicSettings());
    }

    // PUT /admin/settings
    @PutMapping
    public ResponseEntity<ClinicSettingsDTO> updateSettings(@RequestBody ClinicSettingsDTO settingsDTO) {
        return ResponseEntity.ok(configurationService.updateClinicSettings(settingsDTO));
    }
}