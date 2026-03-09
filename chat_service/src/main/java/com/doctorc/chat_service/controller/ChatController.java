package com.doctorc.chat_service.controller;

import com.doctorc.chat_service.entity.Message;
import com.doctorc.chat_service.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/history/{patientId}/{dentistId}")
    public List<Message> getChatHistory(@PathVariable Integer patientId, @PathVariable Integer dentistId) {
        return messageRepository.findByPatientIdAndDentistIdOrderBySentAtAsc(patientId, dentistId);
    }

    @MessageMapping("/chat.sendMessage")
    public void handleMessageAction(@Payload Message incomingMessage) {
        Message messageToBroadcast;
        String action = incomingMessage.getAction();

        if ("DELETE".equalsIgnoreCase(action) && incomingMessage.getMessageId() != null) {
            // 1. Handle Delete
            Optional<Message> existingOpt = messageRepository.findById(incomingMessage.getMessageId());
            if (existingOpt.isPresent()) {
                Message existing = existingOpt.get();
                existing.setDeleted(true);
                existing.setContent("🚫 This message was deleted");
                existing.setAction("DELETE"); // Pass action back to React to trigger state update
                messageToBroadcast = messageRepository.save(existing);
            } else {
                return; // Message not found, do nothing
            }

        } else if ("EDIT".equalsIgnoreCase(action) && incomingMessage.getMessageId() != null) {
            // 2. Handle Edit
            Optional<Message> existingOpt = messageRepository.findById(incomingMessage.getMessageId());
            if (existingOpt.isPresent()) {
                Message existing = existingOpt.get();
                existing.setContent(incomingMessage.getContent()); // Update with new text
                existing.setEdited(true);
                existing.setAction("EDIT"); // Pass action back to React
                messageToBroadcast = messageRepository.save(existing);
            } else {
                return; // Message not found, do nothing
            }

        } else {
            // 3. Handle Standard Send
            incomingMessage.setAction("SEND");
            messageToBroadcast = messageRepository.save(incomingMessage);
        }

        // Broadcast the saved message back to the active WebSocket room
        String room = "/topic/messages/" + messageToBroadcast.getPatientId() + "/" + messageToBroadcast.getDentistId();
        messagingTemplate.convertAndSend(room, messageToBroadcast);
    }
}