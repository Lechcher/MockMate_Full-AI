/**
 * useTTS hook
 * 
 * Text-to-Speech hook for converting text to audio using OpenAI TTS API.
 * Generates speech from text and plays it back using Expo AV.
 * 
 * @example
 * ```tsx
 * import { useTTS } from '@/hooks/useTTS';
 * 
 * function VoiceInterviewScreen() {
 *   const { generateAndPlay, stop, isGenerating, isPlaying } = useTTS();
 * 
 *   const handleReadQuestion = async () => {
 *     try {
 *       await generateAndPlay('What is your greatest strength?');
 *     } catch (err) {
 *       console.error('TTS failed:', err);
 *     }
 *   };
 * 
 *   return (
 *     <View>
 *       <Button onPress={handleReadQuestion} disabled={isGenerating}>
 *         {isPlaying ? 'Playing...' : 'Listen Again'}
 *       </Button>
 *       {isPlaying && <Button onPress={stop}>Stop</Button>}
 *     </View>
 *   );
 * }
 * ```
 * 
 * @returns {Object} TTS controls and state
 * @returns {(text: string) => Promise<Audio.Sound>} generateAndPlay - Generate and play speech
 * @returns {() => Promise<void>} stop - Stop and unload audio
 * @returns {() => Promise<void>} pause - Pause playback
 * @returns {() => Promise<void>} resume - Resume playback
 * @returns {() => Promise<void>} cleanup - Cleanup on unmount
 * @returns {boolean} isGenerating - Whether TTS is generating audio
 * @returns {boolean} isPlaying - Whether audio is currently playing
 * @returns {string | null} error - Error message if any
 */

import { useState } from 'react';
import { Audio } from 'expo-av';
import { generateAPIUrl } from '../lib/utils';
import { fetch as expoFetch } from 'expo/fetch';

export function useTTS() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateAndPlay = async (text: string) => {
    try {
      setIsGenerating(true);
      setError(null);

      // Generate speech
      const response = await expoFetch(generateAPIUrl('/api/tts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      // Convert base64 to audio
      const audioUri = `data:audio/mp3;base64,${data.audio}`;
      
      // Load and play audio
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(audioSound);
      setIsPlaying(true);

      // Set up playback status update
      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      return audioSound;
    } catch (err: any) {
      console.error('TTS error:', err);
      setError(err.message || 'Failed to generate speech');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const stop = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resume = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // Cleanup on unmount
  const cleanup = async () => {
    if (sound) {
      await sound.unloadAsync();
    }
  };

  return {
    generateAndPlay,
    stop,
    pause,
    resume,
    cleanup,
    isGenerating,
    isPlaying,
    error,
  };
}
