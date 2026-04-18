package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.TreatmentEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TreatmentEquipmentRepository extends JpaRepository<TreatmentEquipment, Integer> {
    List<TreatmentEquipment> findByEquipment_EquipmentIdOrderBySession_SessionDateDesc(Integer equipmentId);
}