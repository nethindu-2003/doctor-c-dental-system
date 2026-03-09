package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.AdminPaymentResponse;
import com.doctorc.identity_service.entity.Payment;
import com.doctorc.identity_service.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth/admin/finance")
public class AdminFinancialController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/transactions")
    public List<AdminPaymentResponse> getAllTransactions() {
        // Fetch all payments, newest first
        List<Payment> allPayments = paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "paymentDate"));

        return allPayments.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private AdminPaymentResponse mapToDTO(Payment p) {
        AdminPaymentResponse dto = new AdminPaymentResponse();
        dto.setPaymentId(p.getPaymentId());
        dto.setAmount(p.getAmount());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setStatus(p.getStatus());
        dto.setPaymentType(p.getPaymentType());

        // Handle null patient safety
        if (p.getPatient() != null) {
            dto.setPatientName(p.getPatient().getName() != null ? p.getPatient().getName() : "Unknown Patient");
        } else {
            dto.setPatientName("Guest / Walk-in");
        }

        // Generate smart description
        if ("BOOKING_FEE".equals(p.getPaymentType()) && p.getAppointment() != null) {
            dto.setDescription("Online Booking Fee - " + p.getAppointment().getReasonForVisit());
        } else if ("TREATMENT_PAYMENT".equals(p.getPaymentType()) && p.getTreatment() != null) {
            dto.setDescription("Treatment Charge - " + p.getTreatment().getTreatmentName());
        } else {
            dto.setDescription("General Clinic Charge");
        }

        return dto;
    }
}