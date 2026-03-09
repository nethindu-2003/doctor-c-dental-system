package com.doctorc.identity_service.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminPaymentResponse {
    private Integer paymentId;
    private String patientName;
    private Double amount;
    private LocalDateTime paymentDate;
    private String status;
    private String paymentType; // e.g., 'BOOKING_FEE' or 'TREATMENT_PAYMENT'
    private String description; // Auto-generated based on the type
}