/**
 * WebSocket hook for real-time notifications
 * Connects to the unified backend WebSocket server
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { WS_BASE_URL } from '../services/storeApi';
import logger from '../services/logger';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket(path = '/notifications/', options = {}) {
  const { 
    onMessage, 
    onConnect, 
    onDisconnect, 
    autoReconnect = true,
    enabled = true 
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(function connectWebSocket() {
    if (!enabled) return;
    
    try {
      const wsUrl = `${WS_BASE_URL}${path}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        logger.wsEvent('connected', { path });
        onConnect?.();
      };

      wsRef.current.onclose = (event) => {
        setIsConnected(false);
        logger.wsEvent('disconnected', { path, code: event.code, reason: event.reason });
        onDisconnect?.(event);

        // Auto reconnect logic
        if (autoReconnect && reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            logger.wsEvent('reconnecting', { path, attempt: reconnectAttempts.current });
            connectWebSocket();
          }, RECONNECT_DELAY);
        }
      };

      wsRef.current.onerror = (event) => {
        setError('WebSocket connection error');
        logger.error('WebSocket error', null, { path, event: event.type });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          setMessages((prev) => [...prev.slice(-99), data]); // Keep last 100 messages
          onMessage?.(data);
        } catch (e) {
          logger.error('Failed to parse WebSocket message', e, { path, data: event.data?.substring(0, 100) });
        }
      };
    } catch (e) {
      setError('Failed to connect to WebSocket');
      logger.error('WebSocket connection failed', e, { path });
    }
  }, [path, enabled, autoReconnect, onMessage, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    messages,
    error,
    sendMessage,
    clearMessages,
    connect,
    disconnect
  };
}

/**
 * Hook specifically for payment status updates
 */
export function usePaymentWebSocket(orderId, options = {}) {
  const { onStatusChange, onPaymentConfirmed, onPaymentFailed } = options;

  const handleMessage = useCallback((data) => {
    if (data.type === 'payment_status' && data.order_id === orderId) {
      onStatusChange?.(data.status, data);
      
      if (data.status === 'approved' || data.status === 'completed') {
        onPaymentConfirmed?.(data);
      } else if (data.status === 'rejected' || data.status === 'failed') {
        onPaymentFailed?.(data);
      }
    }
  }, [orderId, onStatusChange, onPaymentConfirmed, onPaymentFailed]);

  return useWebSocket('/payments/', {
    ...options,
    onMessage: handleMessage,
    enabled: Boolean(orderId)
  });
}

/**
 * Hook for order status updates
 */
export function useOrderWebSocket(orderId, options = {}) {
  const { onStatusChange } = options;

  const handleMessage = useCallback((data) => {
    if (data.type === 'order_status' && data.order_id === orderId) {
      onStatusChange?.(data.status, data);
    }
  }, [orderId, onStatusChange]);

  return useWebSocket('/orders/', {
    ...options,
    onMessage: handleMessage,
    enabled: Boolean(orderId)
  });
}

export default useWebSocket;
