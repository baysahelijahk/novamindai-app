
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  const handleSpeak = () => {
    if (isPlaying && speech) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error('Failed to play audio');
      };

      // Set voice properties
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      setSpeech(utterance);
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech is not supported in your browser');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleSpeak}
      className={`p-1 h-auto text-gray-400 hover:text-white ${className}`}
      title={isPlaying ? 'Stop' : 'Listen to this'}
    >
      {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </Button>
  );
};
