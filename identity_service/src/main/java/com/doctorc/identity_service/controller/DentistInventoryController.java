package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.entity.Equipment;
import com.doctorc.identity_service.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth/dentist/inventory")
public class DentistInventoryController {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private com.doctorc.identity_service.repository.TreatmentEquipmentRepository usageRepository;

    // GET ALL INVENTORY (Read-Only for Dentists)
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // GET USAGE HISTORY (For Dentist Clinical Tracking)
    @GetMapping("/{id}/usage")
    public List<com.doctorc.identity_service.dto.InventoryUsageDTO> getUsageHistory(@PathVariable Integer id) {
        return usageRepository.findByEquipment_EquipmentIdOrderBySession_SessionDateDesc(id)
            .stream()
            .map(usage -> new com.doctorc.identity_service.dto.InventoryUsageDTO(
                usage.getSession().getTreatment().getPatient().getName(),
                usage.getSession().getTreatment().getTreatmentName(),
                usage.getSession().getSessionName(),
                usage.getSession().getSessionDate(),
                usage.getQuantityUsed()
            ))
            .toList();
    }
}