
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isExpanded, setIsExpanded] = useState(!apiKey);

  const handleSave = () => {
    if (tempKey.trim()) {
      onApiKeyChange(tempKey.trim());
      setIsExpanded(false);
      setTempKey('');
    }
  };

  if (!isExpanded && apiKey) {
    return (
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-green-400">
            <Key className="h-4 w-4" />
            <span className="text-sm">API Key Connected</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-gray-300 border-gray-600"
          >
            Change Key
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 border-b border-gray-700">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>OpenAI API Key Required</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter your OpenAI API key to enable ChatGPT and DALL-E functionality. 
              Your key is stored locally and never sent to our servers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="sk-..."
                  className="bg-gray-800 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSave} disabled={!tempKey.trim()}>
                Save
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Get your API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
