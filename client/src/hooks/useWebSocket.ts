import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookProps {
  reconnectInterval?: number;
  reconnectAttempts?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

interface WebSocketHookResult {
  sendMessage: (data: any) => void;
  lastMessage: MessageEvent | null;
  readyState: number;
  connectionStatus: 'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting';
}

export function useWebSocket({
  reconnectInterval = 2000,
  reconnectAttempts = 5,
  onOpen,
  onMessage,
  onClose,
  onError,
}: WebSocketHookProps = {}): WebSocketHookResult {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting'>('connecting');
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set up the WebSocket URL correctly for Replit environment
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;
    console.log(`Connecting to WebSocket at: ${wsUrl}`);
    return wsUrl;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (reconnectCount.current >= reconnectAttempts) {
      setConnectionStatus('closed');
      console.error(`WebSocket reconnection failed after ${reconnectAttempts} attempts`);
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      const socket = new WebSocket(wsUrl);
      ws.current = socket;
      setConnectionStatus('connecting');

      socket.onopen = (event) => {
        console.log('WebSocket connection established');
        setReadyState(WebSocket.OPEN);
        setConnectionStatus('open');
        reconnectCount.current = 0;
        if (onOpen) onOpen(event);
      };

      socket.onmessage = (event) => {
        const message = event.data;
        console.log('WebSocket message received:', message);
        setLastMessage(event);
        if (onMessage) onMessage(event);
      };

      socket.onclose = (event) => {
        console.log('WebSocket connection closed');
        setReadyState(WebSocket.CLOSED);
        setConnectionStatus('closed');
        if (onClose) onClose(event);

        // Attempt to reconnect
        if (reconnectCount.current < reconnectAttempts) {
          setConnectionStatus('reconnecting');
          reconnectCount.current += 1;
          reconnectTimeoutId.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectInterval);
        }
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (onError) onError(event);
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      setConnectionStatus('closed');
      
      // Attempt to reconnect on connection error
      if (reconnectCount.current < reconnectAttempts) {
        setConnectionStatus('reconnecting');
        reconnectCount.current += 1;
        reconnectTimeoutId.current = setTimeout(() => {
          connectWebSocket();
        }, reconnectInterval);
      }
    }
  }, [getWebSocketUrl, onOpen, onMessage, onClose, onError, reconnectAttempts, reconnectInterval]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      ws.current.send(message);
    } else {
      console.warn('Cannot send message, WebSocket is not open');
    }
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      // Clean up on unmount
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }

      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connectWebSocket]);

  return { sendMessage, lastMessage, readyState, connectionStatus };
}