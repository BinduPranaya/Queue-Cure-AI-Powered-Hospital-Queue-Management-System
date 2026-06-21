package com.queuecure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Queue Cure - Real-time Clinic Queue Management System.
 *
 * Entry point for the Spring Boot application. This backend exposes REST
 * APIs for patient and queue management, and broadcasts live queue updates
 * to connected clients (receptionist dashboard + patient waiting room)
 * over WebSocket using the STOMP protocol.
 */
@SpringBootApplication
public class QueueCureApplication {

    public static void main(String[] args) {
        SpringApplication.run(QueueCureApplication.class, args);
    }
}
