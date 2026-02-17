package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.TreatmentSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentSessionRepository extends JpaRepository<TreatmentSession, Integer> {
    // No custom methods needed yet! The scheduler just uses the built-in findAll()
}