package com.doctorc.chat_service.controller;

import com.doctorc.chat_service.entity.Message;
import com.doctorc.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- WEBSOCKET ENDPOINT ---

    @MessageMapping("/sendMessage")
    public void receiveAndBroadcastMessage(@Payload Message message) {
        // 1. Save message to database
        Message savedMessage = messageService.saveMessage(message);

        // 2. Create a unique channel for this patient-dentist pair (e.g., /topic/chat/1/2)
        String chatChannel = "/topic/chat/" + message.getPatientId() + "/" + message.getDentistId();

        // 3. Broadcast the saved message to both users subscribed to this channel
        messagingTemplate.convertAndSend(chatChannel, savedMessage);
    }

    // --- REST ENDPOINTS ---

    @GetMapping("/history")
    public ResponseEntity<List<Message>> getHistory(@RequestParam Long patientId, @RequestParam Long dentistId) {
        return ResponseEntity.ok(messageService.getChatHistory(patientId, dentistId));
    }

    @PutMapping("/edit/{messageId}")
    public ResponseEntity<Message> editMessage(@PathVariable Long messageId, @RequestBody String newContent) {
        Message updatedMessage = messageService.editMessage(messageId, newContent);

        // Broadcast the update so the UI changes in real-time
        String chatChannel = "/topic/chat/" + updatedMessage.getPatientId() + "/" + updatedMessage.getDentistId();
        messagingTemplate.convertAndSend(chatChannel, updatedMessage);

        return ResponseEntity.ok(updatedMessage);
    }

    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<Message> deleteMessage(@PathVariable Long messageId) {
        Message deletedMessage = messageService.deleteMessage(messageId);

        // Broadcast the deletion so the UI changes in real-time
        String chatChannel = "/topic/chat/" + deletedMessage.getPatientId() + "/" + deletedMessage.getDentistId();
        messagingTemplate.convertAndSend(chatChannel, deletedMessage);

        return ResponseEntity.ok(deletedMessage);
    }
}