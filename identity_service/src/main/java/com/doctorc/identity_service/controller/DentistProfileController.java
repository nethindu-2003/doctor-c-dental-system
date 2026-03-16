package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.DentistProfileDTO;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.repository.DentistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/dentist/profile")
public class DentistProfileController {

    @Autowired
    private DentistRepository dentistRepository;

    // 1. GET LOGGED-IN DENTIST PROFILE
    @GetMapping
    public DentistProfileDTO getProfile(@RequestAttribute("id") Integer dentistId) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new RuntimeException("Dentist not found"));
        return mapToDTO(dentist);
    }

    // 2. UPDATE PROFILE
    @PutMapping
    public DentistProfileDTO updateProfile(@RequestAttribute("id") Integer dentistId, @RequestBody DentistProfileDTO request) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new RuntimeException("Dentist not found"));

        // Email is usually locked to the account, so we don't update it here
        dentist.setName(request.getName());
        dentist.setPhone(request.getPhone());
        dentist.setSpecialization(request.getSpecialization());
        dentist.setLicenseId(request.getLicenseId());
        dentist.setBio(request.getBio());
        dentist.setProfilePicture(request.getProfilePicture());

        return mapToDTO(dentistRepository.save(dentist));
    }

    private DentistProfileDTO mapToDTO(Dentist d) {
        DentistProfileDTO dto = new DentistProfileDTO();
        dto.setName(d.getName());
        dto.setEmail(d.getEmail());
        dto.setPhone(d.getPhone());
        dto.setSpecialization(d.getSpecialization());
        dto.setLicenseId(d.getLicenseId());
        dto.setBio(d.getBio());
        dto.setProfilePicture(d.getProfilePicture());
        return dto;
    }
}