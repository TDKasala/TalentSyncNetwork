import { useEffect } from 'react';
import { WebSocketDemo } from '@/components/WebSocketDemo';
import { useLanguage } from '@/lib/i18n';

const ChatPage = () => {
  const { t } = useLanguage();

  // Update page title
  useEffect(() => {
    document.title = `${t('app.name')} - Real-time Chat`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Test real-time communication features of TalentSyncZA platform'
      );
    }
  }, [t]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Real-time Communication</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          This page demonstrates the WebSocket connection capabilities of the TalentSyncZA platform
        </p>
      </div>
      
      <WebSocketDemo />
      
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">About This Feature</h2>
        <p className="mb-4">
          WebSockets enable real-time, bi-directional communication between the browser and server.
          This technology powers several features in TalentSyncZA:
        </p>
        
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Instant notifications when you receive a new match</li>
          <li>Real-time chat between recruiters and candidates</li>
          <li>Live updates when assessment results are processed</li>
          <li>Immediate feedback when application status changes</li>
        </ul>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h3 className="font-medium mb-1">Try it yourself:</h3>
          <p>
            Use the interface above to send and receive messages in real-time. The "Send Ping" 
            button will send a simple ping message that the server will respond to with a "pong".
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;