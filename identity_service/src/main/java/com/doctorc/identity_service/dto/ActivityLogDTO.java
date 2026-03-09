package com.doctorc.identity_service.dto;
import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class ActivityLogDTO {
    private String text;
    private String time;
    private String type; // APPOINTMENT, PAYMENT, INVENTORY, PATIENT
}