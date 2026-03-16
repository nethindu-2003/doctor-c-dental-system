package com.doctorc.identity_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminDashboardResponse {
    // --- Existing summary card fields ---
    private Long totalPatients;
    private Long totalAppointments;
    private Double totalRevenue;
    private Long lowStockItems;

    // --- New: Today's clinic status breakdown ---
    private TodaysStats todaysStats;

    // --- New: Detailed low-stock item list ---
    private List<LowStockItem> lowStockList;

    // --- Existing activity log ---
    private List<ActivityLogDTO> recentActivities;

    // ---- Nested Classes ----

    @Data
    public static class TodaysStats {
        private long pending;
        private long completed;
        private long cancelled;
    }

    @Data
    public static class LowStockItem {
        private String name;
        private Integer quantity;
    }
}