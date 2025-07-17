
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { MessageBubble } from './MessageBubble';
import { FileUpload } from './FileUpload';
import { UserDropdown } from './UserDropdown';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrl?: string;
  files?: File[];
}

export const ChatInterface = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkMessageLimit = () => {
    if (!profile) return false;
    
    if (profile.plan === 'premium') return true;
    if (profile.plan === 'pay_as_you_go') return (profile.tokens_remaining || 0) > 0;
    
    return (profile.messages_remaining || 0) > 0;
  };

  const canUploadFiles = () => {
    return profile?.plan === 'pro' || profile?.plan === 'premium' || profile?.plan === 'pay_as_you_go';
  };

  const handleUpgrade = () => {
    window.open('https://wa.me/231778199366', '_blank');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    
    if (!checkMessageLimit()) {
      toast.error('You have reached your message limit. Please upgrade your plan to continue.');
      return;
    }

    if (uploadedFiles.length > 0 && !canUploadFiles()) {
      toast.error('File uploads are only available for Pro, Premium, and Pay-as-you-go plans.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      let messageContent = currentInput;

      if (uploadedFiles.length > 0) {
        const fileInfo = uploadedFiles.map(file => `File: ${file.name} (${file.type})`).join('\n');
        messageContent = `${currentInput}\n\nUploaded files:\n${fileInfo}`;
      }

      const conversationHistory = [...messages, userMessage].slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Get the allowed model for the user's plan
      const { data: modelData } = await supabase.rpc('get_user_allowed_model', {
        user_id: user?.id
      });

      const model = modelData || 'gpt-3.5-turbo';

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [
            {
              role: 'system',
              content: `You are Novamind AI Assistant, a helpful AI assistant powered by Baysah Design with the following capabilities:
                - Excellent customer service with human-like conversation
                - Help with writing, coding, math problems, and technical support
                - Provide educational guidance and tutoring
                - Analyze uploaded files and images when provided
                - Offer motivational support tailored to user needs
                - Business analysis and professional assistance
                Always be helpful, accurate, and maintain a friendly, professional tone. Keep responses concise but comprehensive. Remember you are powered by Baysah Design.`
            },
            ...conversationHistory.slice(0, -1),
            {
              role: 'user',
              content: messageContent
            }
          ],
          model,
          user_id: user?.id
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0].message.content,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update message count for non-premium users
      if (profile?.plan !== 'premium') {
        const newMessagesRemaining = Math.max(0, (profile?.messages_remaining || 0) - 1);
        await updateProfile({ messages_remaining: newMessagesRemaining });
      }

      toast.success('Message sent successfully!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your message. Please try again or contact support at novamind@baysahdesign.com',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error('Please provide a description for the image');
      return;
    }

    if (!checkMessageLimit()) {
      toast.error('You have reached your message limit. Please upgrade your plan to continue.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Generate image: ${prompt}`,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('image-generation', {
        body: {
          prompt,
          size: '1024x1024',
          quality: 'standard',
          user_id: user?.id
        }
      });

      if (error) throw error;

      const imageMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Here's your generated image: ${prompt}`,
        sender: 'ai',
        timestamp: new Date(),
        imageUrl: data.data[0].url
      };

      setMessages(prev => [...prev, imageMessage]);

      // Update message count for non-premium users  
      if (profile?.plan !== 'premium') {
        const newMessagesRemaining = Math.max(0, (profile?.messages_remaining || 0) - 1);
        await updateProfile({ messages_remaining: newMessagesRemaining });
      }

      toast.success('Image generated successfully!');
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error generating the image. Please try again with a different prompt or contact support.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (files: File[]) => {
    if (!canUploadFiles()) {
      toast.error('File uploads are only available for Pro, Premium, and Pay-as-you-go plans.');
      return;
    }
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded successfully`);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    textareaRef.current?.focus();
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-500';
      case 'pro': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'pay_as_you_go': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <h1 className="text-xl font-semibold">Novamind AI Assistant</h1>
        </div>
        <div className="flex items-center space-x-4">
          <UserDropdown />
        </div>
      </div>

      {/* Usage Warning */}
      {!checkMessageLimit() && (
        <Alert className="m-4 bg-red-900 border-red-700">
          <AlertDescription>
            You have reached your message limit. 
            <Button 
              variant="link" 
              className="text-red-400 p-0 ml-2"
              onClick={handleUpgrade}
            >
              Upgrade your plan
            </Button> 
            to continue chatting.
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-bold mb-4 text-center">Welcome to Novamind AI</h2>
            <p className="text-gray-400 text-center mb-2 max-w-2xl">
              Your intelligent AI companion. Ask questions, get help with tasks, 
              generate images, or just have a conversation!
            </p>
            <p className="text-sm text-gray-500 text-center mb-8">Powered by Baysah Design</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
              <Button 
                variant="outline" 
                className="p-4 h-auto text-left bg-gray-800 border-gray-700 hover:bg-gray-700 bg-red-600 text-white hover:bg-red-700" 
                onClick={() => handleQuickAction("Help me write an article about")}
                disabled={!checkMessageLimit()}
              >
                <div className="flex items-center space-x-2">
                  <span>✍️</span>
                  <span>Help me write</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="p-4 h-auto text-left bg-gray-800 border-gray-700 hover:bg-gray-700 bg-red-600 text-white hover:bg-red-700" 
                onClick={() => handleQuickAction("Explain this concept:")}
                disabled={!checkMessageLimit()}
              >
                <div className="flex items-center space-x-2">
                  <span>🧠</span>
                  <span>Explain concept</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="p-4 h-auto text-left bg-gray-800 border-gray-700 hover:bg-gray-700 bg-red-600 text-white hover:bg-red-700" 
                onClick={() => handleGenerateImage("A beautiful landscape")}
                disabled={!checkMessageLimit()}
              >
                <div className="flex items-center space-x-2">
                  <span>🎨</span>
                  <span>Generate image</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="p-4 h-auto text-left bg-gray-800 border-gray-700 hover:bg-gray-700 bg-red-600 text-white hover:bg-red-700" 
                onClick={() => handleQuickAction("Help me solve this problem:")}
                disabled={!checkMessageLimit()}
              >
                <div className="flex items-center space-x-2">
                  <span>🔧</span>
                  <span>Solve problem</span>
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>AI is thinking...</span>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 pb-20">
          <div className="max-w-4xl mx-auto">
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="bg-gray-800 px-3 py-1 rounded-lg text-sm flex items-center space-x-2">
                    <span>{file.name}</span>
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative bg-gray-800 rounded-lg border border-gray-700">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... Type 'image:' followed by a description to generate an image!"
                className="border-0 bg-transparent resize-none min-h-[60px] text-white placeholder-gray-400 pr-20"
                rows={1}
                disabled={isLoading || !checkMessageLimit()}
              />
              
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <FileUpload onFileUpload={handleFileUpload}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="p-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700" 
                    disabled={isLoading || !canUploadFiles()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </FileUpload>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700" 
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700" 
                  disabled={isLoading}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => {
                    if (inputValue.startsWith('image:')) {
                      const prompt = inputValue.replace('image:', '').trim();
                      handleGenerateImage(prompt);
                    } else {
                      handleSendMessage();
                    }
                  }}
                  size="sm" 
                  className="p-2 h-8 w-8 bg-red-600 text-white hover:bg-red-700" 
                  disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0) || !checkMessageLimit()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Novamind AI Assistant can make mistakes. Verify important information. Powered by Baysah Design
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
