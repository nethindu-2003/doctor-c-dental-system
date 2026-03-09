package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.ActivityLogDTO;
import com.doctorc.identity_service.dto.AdminDashboardResponse;
import com.doctorc.identity_service.repository.*;
import com.doctorc.identity_service.entity.Payment;
import com.doctorc.identity_service.entity.Appointment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/auth/admin/dashboard")
public class AdminDashboardController {

    @Autowired private PatientRepository patientRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private EquipmentRepository equipmentRepository;

    @GetMapping("/summary")
    public AdminDashboardResponse getDashboardSummary() {
        AdminDashboardResponse response = new AdminDashboardResponse();

        // 1. Calculate Summary Stats
        response.setTotalPatients(patientRepository.count());
        response.setTotalAppointments(appointmentRepository.count());

        // Sum only completed payments
        Double revenue = paymentRepository.findAll().stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();
        response.setTotalRevenue(revenue);

        // Count Low Stock (Quantity <= Threshold)
        long lowStock = equipmentRepository.findAll().stream()
                .filter(e -> e.getStockQuantity() <= (e.getThreshold() != null ? e.getThreshold() : 20))
                .count();
        response.setLowStockItems(lowStock);

        // 2. Generate Dynamic Activity Logs (Fetch latest records)
        List<ActivityLogDTO> logs = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

        // Get Latest Appointment
        List<Appointment> latestAppts = appointmentRepository.findAll(Sort.by(Sort.Direction.DESC, "appointmentDate"));
        if (!latestAppts.isEmpty()) {
            Appointment appt = latestAppts.get(0);
            String patientName = appt.getPatient() != null ? appt.getPatient().getName() : "Walk-in Guest";
            logs.add(new ActivityLogDTO(
                    "Appointment scheduled for " + patientName,
                    appt.getAppointmentDate().toString(),
                    "APPOINTMENT"
            ));
        }

        // Get Latest Payment
        List<Payment> latestPayments = paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "paymentDate"));
        if (!latestPayments.isEmpty()) {
            Payment pay = latestPayments.get(0);
            String patientName = pay.getPatient() != null ? pay.getPatient().getName() : "Walk-in Guest";
            logs.add(new ActivityLogDTO(
                    "Payment received from " + patientName + " (LKR " + pay.getAmount() + ")",
                    pay.getPaymentDate() != null ? pay.getPaymentDate().format(formatter) : "Recently",
                    "PAYMENT"
            ));
        }

        response.setRecentActivities(logs);
        return response;
    }
}