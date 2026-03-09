package com.doctorc.identity_service.dto;
import lombok.Data;
import java.util.List;

@Data
public class TreatmentHistoryDTO {
    private Integer treatmentId;
    private String treatmentName;
    private String status;
    private String dentistName;
    private List<SessionDTO> sessions;

    @Data
    public static class SessionDTO {
        private String sessionDate;
        private String notes;
    }
}