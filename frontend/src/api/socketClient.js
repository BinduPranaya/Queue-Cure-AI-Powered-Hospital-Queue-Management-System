import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL } from "./apiClient";

const QUEUE_TOPIC = "/topic/queue";

/**
 * Creates (but does not yet activate) a STOMP client connected over
 * SockJS to the backend's /ws endpoint. Callers provide lifecycle
 * callbacks; this wrapper just handles connection plumbing and
 * reconnection so every screen behaves consistently.
 */
export function createQueueSocketClient({ onMessage, onConnected, onDisconnected, onError }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      client.subscribe(QUEUE_TOPIC, (message) => {
        try {
          const payload = JSON.parse(message.body);
          onMessage?.(payload);
        } catch (err) {
          console.error("Failed to parse queue update message", err);
        }
      });
      onConnected?.();
    },

    onDisconnect: () => {
      onDisconnected?.();
    },

    onWebSocketClose: () => {
      onDisconnected?.();
    },

    onStompError: (frame) => {
      onError?.(frame);
    },
  });

  return client;
}
