
import React from 'react';
import { Message } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { Copy, Share2 } from 'lucide-react';
import { TextToSpeech } from './TextToSpeech';
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Novamind AI Chat',
        text: message.content,
      });
    } else {
      navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard!');
    }
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl rounded-lg p-4 ${
        message.sender === 'user' 
          ? 'bg-blue-600 text-white ml-12' 
          : 'bg-gray-800 text-white mr-12'
      }`}>
        {message.imageUrl && (
          <img 
            src={message.imageUrl} 
            alt="Generated" 
            className="w-full rounded-lg mb-2"
          />
        )}
        
        {message.files && message.files.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-2">
              {message.files.map((file, index) => (
                <div key={index} className="bg-gray-700 px-2 py-1 rounded text-xs">
                  📎 {file.name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </div>
          
          {/* Action buttons for AI messages */}
          {message.sender === 'ai' && (
            <div className="flex items-center space-x-1">
              <TextToSpeech text={message.content} />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCopy}
                className="p-1 h-auto text-gray-400 hover:text-white"
                title="Copy message"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="p-1 h-auto text-gray-400 hover:text-white"
                title="Share message"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
