package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.ClinicConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicConfigurationRepository extends JpaRepository<ClinicConfiguration, Integer> {
}