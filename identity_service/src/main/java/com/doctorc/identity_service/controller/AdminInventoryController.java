package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.entity.Equipment;
import com.doctorc.identity_service.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/auth/admin/inventory")
public class AdminInventoryController {

    @Autowired
    private EquipmentRepository equipmentRepository;

    // 1. GET ALL INVENTORY
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // 2. ADD NEW ITEM
    @PostMapping
    public Equipment addEquipment(@RequestAttribute("id") Integer adminId, @RequestBody Equipment equipment) {
        equipment.setAdminId(adminId);
        equipment.setLastUpdated(LocalDate.now());
        return equipmentRepository.save(equipment);
    }

    // 3. UPDATE ITEM
    @PutMapping("/{id}")
    public Equipment updateEquipment(@PathVariable Integer id, @RequestAttribute("id") Integer adminId, @RequestBody Equipment updatedData) {
        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        existing.setName(updatedData.getName());
        existing.setCategory(updatedData.getCategory());
        existing.setStockQuantity(updatedData.getStockQuantity());
        existing.setThreshold(updatedData.getThreshold());
        existing.setUnitCost(updatedData.getUnitCost());

        // Stamp who updated it and when
        existing.setAdminId(adminId);
        existing.setLastUpdated(LocalDate.now());

        return equipmentRepository.save(existing);
    }

    // 4. DELETE ITEM
    @DeleteMapping("/{id}")
    public String deleteEquipment(@PathVariable Integer id) {
        equipmentRepository.deleteById(id);
        return "Item deleted successfully.";
    }
}