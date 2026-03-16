package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.TreatmentEquipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreatmentEquipmentRepository extends JpaRepository<TreatmentEquipment, Integer> {
}