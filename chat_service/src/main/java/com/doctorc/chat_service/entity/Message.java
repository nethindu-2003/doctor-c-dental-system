package com.doctorc.chat_service.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "message")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private String senderType;

    @Column(nullable = false)
    private String receiverType;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long dentistId;

    @Column(nullable = false)
    private boolean isEdited = false;

    @Column(nullable = false)
    private boolean isDeleted = false;
}