package com.doctorc.identity_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryUsageDTO {
    private String patientName;
    private String treatmentName;
    private String sessionName;
    private LocalDate usageDate;
    private Integer quantityUsed;
}
