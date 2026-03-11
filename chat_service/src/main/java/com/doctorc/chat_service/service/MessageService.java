package com.doctorc.chat_service.service;

import com.doctorc.chat_service.entity.Message;
import com.doctorc.chat_service.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(Long patientId, Long dentistId) {
        return messageRepository.findByPatientIdAndDentistIdOrderBySentAtAsc(patientId, dentistId);
    }

    public Message editMessage(Long messageId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.isDeleted()) {
            message.setContent(newContent);
            message.setEdited(true);
            return messageRepository.save(message);
        }
        throw new RuntimeException("Cannot edit a deleted message");
    }

    public Message deleteMessage(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.setDeleted(true);
        message.setContent("This message was deleted");
        return messageRepository.save(message);
    }
}