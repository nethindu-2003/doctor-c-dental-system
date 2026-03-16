package com.doctorc.identity_service.dto;
import lombok.Data;

@Data
public class DentistPatientRowDTO {
    private Integer patientId;
    private String name;
    private String email;
    private String phone;
    private String profilePicture;  // Add this field for chat profile pictures
    private String currentTreatment; // From Treatment table
    private String lastVisit;        // From TreatmentSession updated_at
}