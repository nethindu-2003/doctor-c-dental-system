package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Integer> {
    // Finds equipment where stock is less than or equal to the entity's own threshold (existing)
    @Query("SELECT e FROM Equipment e WHERE e.stockQuantity <= e.threshold")
    List<Equipment> findLowStockEquipment();

    // Finds equipment below a given fixed numeric threshold (used by admin dashboard)
    List<Equipment> findByStockQuantityLessThanEqual(Integer threshold);
}