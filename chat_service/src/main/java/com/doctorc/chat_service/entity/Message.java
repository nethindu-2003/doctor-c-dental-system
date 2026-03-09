package com.doctorc.chat_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Integer messageId;

    @Column(name = "patient_id", nullable = false)
    private Integer patientId;

    @Column(name = "dentist_id", nullable = false)
    private Integer dentistId;

    @Column(name = "sender_type", nullable = false)
    private String senderType;

    @Column(name = "receiver_type", nullable = false)
    private String receiverType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    // --- NEW FIELDS FOR UI STATE ---
    @Column(name = "is_edited")
    private boolean isEdited = false;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // @Transient tells Hibernate to ignore this field when saving to MySQL,
    // but allows Spring to read it from the React JSON payload.
    @Transient
    private String action;

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }
}