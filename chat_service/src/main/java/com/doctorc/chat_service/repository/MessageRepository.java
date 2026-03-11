package com.doctorc.chat_service.repository;

import com.doctorc.chat_service.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetch chat history between a specific patient and dentist
    List<Message> findByPatientIdAndDentistIdOrderBySentAtAsc(Long patientId, Long dentistId);
}