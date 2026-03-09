package com.doctorc.identity_service.dto;
import lombok.Data;
import java.util.List;

@Data
public class AdminDashboardResponse {
    private Long totalPatients;
    private Long totalAppointments;
    private Double totalRevenue;
    private Long lowStockItems;
    private List<ActivityLogDTO> recentActivities;
}