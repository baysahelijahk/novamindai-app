
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Trash2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  message_count: number;
  last_message: string;
}

export const ChatHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      // For now, we'll simulate chat history since we don't have a chat_sessions table
      // In a real implementation, you'd query your chat sessions table
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          title: 'General AI Chat',
          created_at: new Date().toISOString(),
          message_count: 5,
          last_message: 'Thanks for your help!'
        },
        {
          id: '2',
          title: 'Code Review Discussion',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          message_count: 12,
          last_message: 'The code looks good now.'
        }
      ];
      setChatSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleShareChat = (sessionId: string) => {
    const shareUrl = `${window.location.origin}/shared-chat/${sessionId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Chat link copied to clipboard!');
  };

  const handleDeleteChat = async (sessionId: string) => {
    try {
      // Implement delete functionality
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Chat session deleted');
    } catch (error) {
      toast.error('Failed to delete chat session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-white">Loading chat history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold">Chat History</h1>
              <p className="text-sm text-gray-400">View and manage your previous conversations</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {chatSessions.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No chat history yet</h3>
              <p className="text-gray-400 text-center mb-4">
                Start a conversation to see your chat history here
              </p>
              <Button 
                onClick={() => navigate('/chat')}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Start Chatting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {chatSessions.map((session) => (
              <Card key={session.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{session.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleShareChat(session.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteChat(session.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">{session.last_message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{session.message_count} messages</span>
                      <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
