import React, { useState } from 'react';
import { useWebSocketContext } from './WebSocketProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function WebSocketDemo() {
  const { sendMessage, lastMessage, connectionStatus } = useWebSocketContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ type: string; content: string; timestamp: string }>>([]);

  // Get color based on connection status
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'open':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'closing':
      case 'closed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Parse and display last message 
  React.useEffect(() => {
    if (lastMessage) {
      try {
        const parsedData = JSON.parse(lastMessage.data);
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        
        setMessages(prev => [
          ...prev,
          {
            type: 'received',
            content: JSON.stringify(parsedData, null, 2),
            timestamp
          }
        ]);
      } catch (err) {
        console.error('Error parsing message', err);
      }
    }
  }, [lastMessage]);

  // Send a message to the server
  const handleSendMessage = () => {
    if (message.trim()) {
      try {
        // Try to parse as JSON if it starts with { or [
        let msgToSend;
        if (message.trim().startsWith('{') || message.trim().startsWith('[')) {
          msgToSend = JSON.parse(message);
        } else {
          // Default to a ping message format
          msgToSend = { type: 'ping', message };
        }
        
        sendMessage(msgToSend);
        
        // Add to message history
        const now = new Date();
        const timestamp = now.toLocaleTimeString();
        
        setMessages(prev => [
          ...prev,
          {
            type: 'sent',
            content: JSON.stringify(msgToSend, null, 2),
            timestamp
          }
        ]);
        
        // Clear input
        setMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  // Send ping message
  const sendPing = () => {
    const pingMessage = { type: 'ping', timestamp: Date.now() };
    sendMessage(pingMessage);
    
    // Add to message history
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    
    setMessages(prev => [
      ...prev,
      {
        type: 'sent',
        content: JSON.stringify(pingMessage, null, 2),
        timestamp
      }
    ]);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          WebSocket Connection Demo
          <Badge className={`${getStatusColor()} text-white`}>
            {connectionStatus}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test real-time communication with the TalentSyncZA server
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="h-64 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 mt-4">No messages yet. Try sending a ping!</p>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-2 p-2 rounded ${
                    msg.type === 'sent' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-left ml-auto max-w-[80%]' 
                      : 'bg-gray-100 dark:bg-gray-800 text-left max-w-[80%]'
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.type === 'sent' ? 'Sent' : 'Received'} at {msg.timestamp}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {msg.content}
                  </pre>
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message or JSON object..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={sendPing}
              className="w-full"
            >
              Send Ping
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-sm">
        {connectionStatus === 'open' ? (
          <p className="text-green-600">
            ✓ Connection established with the server
          </p>
        ) : connectionStatus === 'reconnecting' ? (
          <p className="text-yellow-600">
            ⟳ Attempting to reconnect to the server...
          </p>
        ) : connectionStatus === 'closed' ? (
          <div className="w-full">
            <p className="text-red-600 mb-2">
              ✗ Connection to the server failed
            </p>
            <p className="text-gray-500 text-xs">
              This is expected in the demo environment. In production, WebSockets would connect to a dedicated server.
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            Connecting to the server...
          </p>
        )}
      </CardFooter>
    </Card>
  );
}