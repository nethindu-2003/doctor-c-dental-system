package com.doctorc.identity_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DentistDTO {
    private Integer id;
    private String name;
    private String specialization;
}