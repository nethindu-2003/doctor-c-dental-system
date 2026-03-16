package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.ClinicSettingsDTO;
import com.doctorc.identity_service.service.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public-facing endpoint for clinic settings.
 * Mapped under /auth/public/** which should be added to permitAll() in AuthConfig.
 * Returns only non-sensitive configuration needed by the public UI.
 */
@RestController
@RequestMapping("/auth/public")
public class PublicController {

    @Autowired
    private ConfigurationService configurationService;

    /**
     * GET /auth/public/settings
     * Returns clinic config + schedules without requiring authentication.
     * Used by the frontend ClinicContext on every page load.
     */
    @GetMapping("/settings")
    public ResponseEntity<ClinicSettingsDTO> getPublicSettings() {
        return ResponseEntity.ok(configurationService.getClinicSettings());
    }
}
