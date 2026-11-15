package com.queuecure.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Thin wrapper around {@link SimpMessagingTemplate} responsible for pushing
 * {@link QueueUpdateEvent} messages to every client subscribed to
 * {@code /topic/queue}. Kept as its own component so the service layer
 * doesn't need to know any STOMP/messaging details directly.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QueueBroadcaster {

    private static final String QUEUE_TOPIC = "/topic/queue";

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcast(QueueUpdateEvent event) {
        try {
            messagingTemplate.convertAndSend(QUEUE_TOPIC, event);
            log.debug("Broadcast queue event: {}", event.eventType());
        } catch (Exception ex) {
            // A broadcast failure should never break the originating REST
            // request - we log it so it can be investigated, but the HTTP
            // response to the receptionist/patient still succeeds since
            // the change is already persisted in PostgreSQL.
            log.error("Failed to broadcast queue update event [{}]: {}", event.eventType(), ex.getMessage(), ex);
        }
    }
}
