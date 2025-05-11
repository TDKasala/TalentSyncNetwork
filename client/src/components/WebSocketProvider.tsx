import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';

type ConnectionStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting';

interface WebSocketContextValue {
  sendMessage: (data: any) => void;
  lastMessage: MessageEvent | null;
  connectionStatus: ConnectionStatus;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [hasShownReconnectToast, setHasShownReconnectToast] = useState(false);
  
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket({
    onOpen: () => {
      console.log('WebSocket connected successfully');
      // Reset the toast flag when connection is established
      setHasShownReconnectToast(false);
    },
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        
        // Handle specific message types here
        if (data.type === 'notification') {
          toast({
            title: "New Notification",
            description: data.message,
            duration: 5000,
          });
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    },
    onError: (event) => {
      console.error('WebSocket error:', event);
    }
  });
  
  // Show a toast when reconnecting
  useEffect(() => {
    if (connectionStatus === 'reconnecting' && !hasShownReconnectToast) {
      toast({
        title: "Connection Issue",
        description: "Attempting to reconnect to the server...",
        variant: "destructive",
        duration: 5000,
      });
      setHasShownReconnectToast(true);
    }
  }, [connectionStatus, hasShownReconnectToast, toast]);
  
  return (
    <WebSocketContext.Provider value={{ sendMessage, lastMessage, connectionStatus }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}