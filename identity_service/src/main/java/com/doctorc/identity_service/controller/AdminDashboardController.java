package com.doctorc.identity_service.controller;

import com.doctorc.identity_service.dto.ActivityLogDTO;
import com.doctorc.identity_service.dto.AdminDashboardResponse;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Equipment;
import com.doctorc.identity_service.entity.Payment;
import com.doctorc.identity_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

        // ── 1. Existing Summary Stats ─────────────────────────────────────────
        response.setTotalPatients(patientRepository.count());
        response.setTotalAppointments(appointmentRepository.count());

        // Sum only completed payments
        Double revenue = paymentRepository.findAll().stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();
        response.setTotalRevenue(revenue);

        // ── 2. NEW: Today's Clinic Status ─────────────────────────────────────
        LocalDate today = LocalDate.now();
        List<Appointment> todaysAppointments = appointmentRepository.findByAppointmentDate(today);

        long pendingCount = 0, completedCount = 0, cancelledCount = 0;
        for (Appointment appt : todaysAppointments) {
            String status = appt.getStatus();
            if ("PENDING".equals(status) || "CONFIRMED".equals(status)) {
                pendingCount++;
            } else if ("COMPLETED".equals(status)) {
                completedCount++;
            } else if ("CANCELLED".equals(status)) {
                cancelledCount++;
            }
        }
        AdminDashboardResponse.TodaysStats tStats = new AdminDashboardResponse.TodaysStats();
        tStats.setPending(pendingCount);
        tStats.setCompleted(completedCount);
        tStats.setCancelled(cancelledCount);
        response.setTodaysStats(tStats);

        // ── 3. NEW: Urgent Low-Stock Alert List ──────────────────────────────
        final int LOW_STOCK_THRESHOLD = 15;
        List<Equipment> lowStockEquipment = equipmentRepository.findByStockQuantityLessThanEqual(LOW_STOCK_THRESHOLD);

        List<AdminDashboardResponse.LowStockItem> lowStockList = lowStockEquipment.stream().map(eq -> {
            AdminDashboardResponse.LowStockItem item = new AdminDashboardResponse.LowStockItem();
            item.setName(eq.getName());
            item.setQuantity(eq.getStockQuantity());
            return item;
        }).collect(Collectors.toList());

        response.setLowStockList(lowStockList);
        // Keep the summary card count consistent with the detailed list
        response.setLowStockItems((long) lowStockList.size());

        // ── 4. Existing Dynamic Activity Logs ────────────────────────────────
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