package com.doctorc.identity_service.service;

import com.doctorc.identity_service.dto.AdminReportDTO;
import com.doctorc.identity_service.entity.Appointment;
import com.doctorc.identity_service.entity.Patient;
import com.doctorc.identity_service.entity.Payment;
import com.doctorc.identity_service.repository.AppointmentRepository;
import com.doctorc.identity_service.repository.PatientRepository;
import com.doctorc.identity_service.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminReportService {

    @Autowired private PatientRepository patientRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private PaymentRepository paymentRepository;

    public List<AdminReportDTO.PatientSummary> getAllPatientSummaries() {
        List<Patient> allPatients = patientRepository.findAll();

        return allPatients.stream().map(patient -> {
            AdminReportDTO.PatientSummary summary = new AdminReportDTO.PatientSummary();
            summary.setPatientId(patient.getId());
            summary.setPatientName(patient.getName());
            summary.setContactNumber(patient.getPhone());

            List<Appointment> apps = appointmentRepository.findByPatient_Id(patient.getId());
            summary.setTotalAppointments((long) apps.size());

            summary.setLastVisitDate(apps.stream()
                    .map(Appointment::getAppointmentDate)
                    .max(LocalDate::compareTo)
                    .orElse(null));

            List<Payment> payments = paymentRepository.findByPatient_Id(patient.getId());
            double totalSpent = payments.stream()
                    .filter(p -> "COMPLETED".equals(p.getStatus()))
                    .mapToDouble(Payment::getAmount)
                    .sum();
            summary.setTotalSpent(totalSpent);

            return summary;
        }).collect(Collectors.toList());
    }

    // Changed parameter to Integer
    public AdminReportDTO.PatientFullReport getPatientFullReport(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        AdminReportDTO.PatientFullReport report = new AdminReportDTO.PatientFullReport();
        report.setPatientId(patient.getId());
        report.setPatientName(patient.getName());
        report.setEmail(patient.getEmail());
        report.setContactNumber(patient.getPhone());

        List<AdminReportDTO.AppointmentRecord> appHistory = appointmentRepository.findByPatient_Id(patientId).stream().map(app -> {
            AdminReportDTO.AppointmentRecord record = new AdminReportDTO.AppointmentRecord();
            record.setAppointmentId(app.getAppointmentId()); // Fixed getter
            record.setDate(app.getAppointmentDate());
            record.setTime(app.getAppointmentTime() != null ? app.getAppointmentTime().toString() : "N/A");
            record.setDentistName(app.getDentist() != null ? app.getDentist().getName() : "Unassigned");
            record.setStatus(app.getStatus());

            // Fallback for missing getReason() method. Change this to your actual entity field getter if you have one.
            record.setTreatmentDescription("General Visit");
            return record;
        }).collect(Collectors.toList());
        report.setAppointmentHistory(appHistory);

        List<AdminReportDTO.PaymentRecord> payHistory = paymentRepository.findByPatient_Id(patientId).stream().map(pay -> {
            AdminReportDTO.PaymentRecord record = new AdminReportDTO.PaymentRecord();
            record.setPaymentId(pay.getPaymentId()); // Fixed getter
            record.setPaymentDate(pay.getPaymentDate() != null ? pay.getPaymentDate().toLocalDate() : null);
            record.setAmount(pay.getAmount());
            record.setStatus(pay.getStatus());

            // Fallback for missing getDescription() method.
            record.setDescription("Clinic Payment");
            return record;
        }).collect(Collectors.toList());
        report.setPaymentHistory(payHistory);

        return report;
    }
}