import { useCallback, useEffect, useRef, useState } from "react";
import { createQueueSocketClient } from "../api/socketClient";
import { getQueueStatus, getWaitingPatients } from "../api/queueApi";
import { QueueContext } from "../hooks/useQueue";

/**
 * Provides live queue state (status + waiting list) to the whole app.
 *
 * On mount, fetches the current snapshot via REST, then opens a
 * WebSocket/STOMP connection to receive live updates whenever the
 * receptionist adds/removes a patient, calls next, or changes settings.
 * If the socket disconnects, a "Live Queue Connected" indicator flips to
 * reconnecting and falls back to polling every 5s until it's back.
 */
export function QueueProvider({ children }) {
  const [queueStatus, setQueueStatus] = useState(null);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  const clientRef = useRef(null);
  const pollRef = useRef(null);

  const refreshFromServer = useCallback(async () => {
    try {
      const [status, waiting] = await Promise.all([getQueueStatus(), getWaitingPatients()]);
      setQueueStatus(status);
      setWaitingPatients(waiting);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load queue data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSocketMessage = useCallback((payload) => {
    setQueueStatus(payload.queueStatus);
    setWaitingPatients(payload.waitingPatients || []);
    setLastEvent({ type: payload.eventType, timestamp: payload.timestamp });
    setError(null);
  }, []);

  useEffect(() => {
    // This effect subscribes to two external systems on mount: an initial
    // REST snapshot and a persistent WebSocket subscription. Both are
    // one-time setup, not state derived from reactive values, so the
    // setState calls inside are the intended pattern here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshFromServer();

    const client = createQueueSocketClient({
      onMessage: handleSocketMessage,
      onConnected: () => {
        setConnected(true);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        // Re-sync once on (re)connect in case we missed events while offline.
        refreshFromServer();
      },
      onDisconnected: () => {
        setConnected(false);
        if (!pollRef.current) {
          pollRef.current = setInterval(refreshFromServer, 5000);
        }
      },
      onError: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    queueStatus,
    waitingPatients,
    connected,
    loading,
    error,
    lastEvent,
    refresh: refreshFromServer,
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}
