package com.queuecure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configures the STOMP-over-WebSocket message broker.
 *
 * Clients connect to the {@code /ws} endpoint (with SockJS fallback) and
 * subscribe to {@code /topic/queue} to receive live queue updates whenever
 * the receptionist adds a patient, removes a patient, calls the next
 * patient, or updates the consultation time.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Messages whose destination starts with /topic are routed to subscribers
        // by the simple in-memory broker.
        registry.enableSimpleBroker("/topic");
        // Messages from clients to the server (not heavily used in this app,
        // but kept for future client -> server messaging) are prefixed with /app.
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
