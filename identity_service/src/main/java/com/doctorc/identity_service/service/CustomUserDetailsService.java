package com.doctorc.identity_service.service;

import com.doctorc.identity_service.entity.Admin;
import com.doctorc.identity_service.entity.Dentist;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.repository.AdminRepository;
import com.doctorc.identity_service.repository.DentistRepository;
import com.doctorc.identity_service.repository.PatientRepository;
import com.doctorc.identity_service.config.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private DentistRepository dentistRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Check all 3 tables
        Optional<Patient> patient = patientRepository.findByEmail(username);
        if (patient.isPresent()) {
            if (patient.get().getIsActive() == null || !patient.get().getIsActive()) {
                throw new UsernameNotFoundException("Account deactivated");
            }
            return new CustomUserDetails(patient.get().getEmail(), patient.get().getPassword(), true);
        }

        Optional<Admin> admin = adminRepository.findByEmail(username);
        if (admin.isPresent())
            return new CustomUserDetails(admin.get().getEmail(), admin.get().getPassword(), true);

        Optional<Dentist> dentist = dentistRepository.findByEmail(username);
        if (dentist.isPresent())
            return new CustomUserDetails(dentist.get().getEmail(), dentist.get().getPassword(), true);

        throw new UsernameNotFoundException("User not found with email: " + username);
    }
}