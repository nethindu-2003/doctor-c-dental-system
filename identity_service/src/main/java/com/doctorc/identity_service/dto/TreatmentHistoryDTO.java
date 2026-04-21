package com.doctorc.identity_service.dto;
import lombok.Data;
import java.util.List;

@Data
public class TreatmentHistoryDTO {
    private Integer treatmentId;
    private String treatmentName;
    private String diagnosis;
    private String status;
    private String dentistName;
    private String startDate;
    private String endDate;
    private Double cost;
    private List<SessionDTO> sessions;

    @Data
    public static class SessionDTO {
        private String sessionDate;
        private String notes;
    }
}