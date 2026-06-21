package com.queuecure.util;

/**
 * Shared constants used across the queue management domain.
 */
public final class QueueConstants {

    private QueueConstants() {
        // utility class
    }

    public static final String WEBSOCKET_ENDPOINT = "/ws";
    public static final String QUEUE_TOPIC = "/topic/queue";
    public static final int DEFAULT_AVERAGE_CONSULTATION_TIME_MINUTES = 10;
    public static final int NO_CURRENT_TOKEN = 0;
}
