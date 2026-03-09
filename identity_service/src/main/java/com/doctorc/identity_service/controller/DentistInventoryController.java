package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.entity.Equipment;
import com.doctorc.identity_service.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth/dentist/inventory")
public class DentistInventoryController {

    @Autowired
    private EquipmentRepository equipmentRepository;

    // GET ALL INVENTORY (Read-Only for Dentists)
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }
}