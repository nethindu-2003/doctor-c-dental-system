package com.doctorc.chat_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint React will use to connect to the websocket
        // Allowed origins set to * for development. In production, restrict to http://localhost:3000
        registry.addEndpoint("/ws-chat").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // "/topic" is used to broadcast messages to specific chat rooms
        registry.enableSimpleBroker("/topic");

        // "/app" is the prefix React will use when SENDING a message to the backend
        registry.setApplicationDestinationPrefixes("/app");
    }
}