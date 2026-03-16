package com.doctorc.identity_service.service;

import com.doctorc.identity_service.dto.ClinicSettingsDTO;
import com.doctorc.identity_service.entity.ClinicConfiguration;
import com.doctorc.identity_service.entity.ClinicSchedule;
import com.doctorc.identity_service.repository.ClinicConfigurationRepository;
import com.doctorc.identity_service.repository.ClinicScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConfigurationService {

    @Autowired private ClinicConfigurationRepository configRepository;
    @Autowired private ClinicScheduleRepository scheduleRepository;

    // 1. Get All Settings
    public ClinicSettingsDTO getClinicSettings() {
        // Fetch the singleton config (ID = 1)
        ClinicConfiguration config = configRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Configuration not found! Did you run the SQL seed script?"));

        // Fetch the schedules
        List<ClinicSchedule> schedules = scheduleRepository.findAll();

        // Map to DTO
        ClinicSettingsDTO dto = new ClinicSettingsDTO();
        dto.setClinicName(config.getClinicName());
        dto.setClinicAddress(config.getClinicAddress());
        dto.setClinicPhone(config.getClinicPhone());
        dto.setClinicEmail(config.getClinicEmail());
        dto.setClinicLogo(config.getClinicLogo());
        dto.setStandardBookingFee(config.getStandardBookingFee());

        List<ClinicSettingsDTO.ScheduleDTO> scheduleDTOs = schedules.stream().map(s -> {
            ClinicSettingsDTO.ScheduleDTO sDto = new ClinicSettingsDTO.ScheduleDTO();
            sDto.setDayOfWeek(s.getDayOfWeek());
            sDto.setOpenTime(s.getOpenTime());
            sDto.setCloseTime(s.getCloseTime());
            sDto.setIsClosed(s.getIsClosed());
            return sDto;
        }).collect(Collectors.toList());

        dto.setSchedules(scheduleDTOs);
        return dto;
    }

    // 2. Update Settings
    @Transactional
    public ClinicSettingsDTO updateClinicSettings(ClinicSettingsDTO dto) {
        // Update Config
        ClinicConfiguration config = configRepository.findById(1).orElseThrow();
        config.setClinicName(dto.getClinicName());
        config.setClinicAddress(dto.getClinicAddress());
        config.setClinicPhone(dto.getClinicPhone());
        config.setClinicEmail(dto.getClinicEmail());
        config.setStandardBookingFee(dto.getStandardBookingFee());

        if (dto.getClinicLogo() != null) {
            config.setClinicLogo(dto.getClinicLogo());
        }
        configRepository.save(config);

        // Update Schedules
        if (dto.getSchedules() != null) {
            for (ClinicSettingsDTO.ScheduleDTO sDto : dto.getSchedules()) {
                ClinicSchedule schedule = scheduleRepository.findByDayOfWeek(sDto.getDayOfWeek());
                if (schedule != null) {
                    schedule.setOpenTime(sDto.getOpenTime());
                    schedule.setCloseTime(sDto.getCloseTime());
                    schedule.setIsClosed(sDto.getIsClosed());
                    scheduleRepository.save(schedule);
                }
            }
        }

        return getClinicSettings(); // Return the updated data
    }
}