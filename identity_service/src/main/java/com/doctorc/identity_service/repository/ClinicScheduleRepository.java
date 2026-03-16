package com.doctorc.identity_service.repository;

import com.doctorc.identity_service.entity.ClinicSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicScheduleRepository extends JpaRepository<ClinicSchedule, Integer> {
    // Helper method to find a specific day easily
    ClinicSchedule findByDayOfWeek(String dayOfWeek);
}