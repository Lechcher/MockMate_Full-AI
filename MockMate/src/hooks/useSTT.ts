/**
 * useSTT hook
 * 
 * Speech-to-Text hook for recording audio and transcribing it using OpenAI Whisper API.
 * Handles microphone permissions, audio recording via Expo AV, and transcription.
 * 
 * @example
 * ```tsx
 * import { useSTT } from '@/hooks/useSTT';
 * 
 * function VoiceInterviewScreen() {
 *   const { 
 *     startRecording, 
 *     stopRecording, 
 *     transcribeAudio, 
 *     isRecording,
 *     duration 
 *   } = useSTT();
 * 
 *   const handleRecord = async () => {
 *     if (isRecording) {
 *       const uri = await stopRecording();
 *       if (uri) {
 *         const result = await transcribeAudio(uri);
 *         console.log('Transcript:', result.text);
 *       }
 *     } else {
 *       await startRecording();
 *     }
 *   };
 * 
 *   return (
 *     <View>
 *       <Button onPress={handleRecord}>
 *         {isRecording ? `Recording... ${duration}s` : 'Start Recording'}
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 * 
 * @returns {Object} STT controls and state
 * @returns {() => Promise<void>} startRecording - Start audio recording
 * @returns {() => Promise<string | null>} stopRecording - Stop recording and return audio URI
 * @returns {(audioUri: string) => Promise<Object>} transcribeAudio - Transcribe audio file
 * @returns {() => Promise<Function>} recordAndTranscribe - Start recording and return stop function
 * @returns {() => Promise<void>} cancelRecording - Cancel and discard recording
 * @returns {() => Promise<void>} cleanup - Cleanup on unmount
 * @returns {boolean} isRecording - Whether actively recording
 * @returns {boolean} isTranscribing - Whether transcribing audio
 * @returns {string} transcript - Last transcription result
 * @returns {number} duration - Recording duration in seconds
 * @returns {string | null} error - Error message if any
 */

import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { generateAPIUrl } from '../lib/utils';
import { fetch as expoFetch } from 'expo/fetch';

export function useSTT() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Microphone permission denied');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Start recording error:', err);
      setError(err.message || 'Failed to start recording');
      throw err;
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        throw new Error('No active recording');
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      recordingRef.current = null;
      setIsRecording(false);

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      return uri;
    } catch (err: any) {
      console.error('Stop recording error:', err);
      setError(err.message || 'Failed to stop recording');
      throw err;
    }
  };

  const transcribeAudio = async (audioUri: string) => {
    try {
      setIsTranscribing(true);
      setError(null);

      // Read audio file as base64
      const response = await expoFetch(audioUri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Send to STT API
      const sttResponse = await expoFetch(generateAPIUrl('/api/stt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: base64 }),
      });

      if (!sttResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await sttResponse.json();
      setTranscript(data.text);

      return {
        text: data.text,
        language: data.language,
        durationInSeconds: data.durationInSeconds,
        segments: data.segments,
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err.message || 'Failed to transcribe audio');
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };

  const recordAndTranscribe = async () => {
    try {
      await startRecording();
      
      // Return a function to stop and transcribe
      return async () => {
        const uri = await stopRecording();
        if (uri) {
          return await transcribeAudio(uri);
        }
        throw new Error('No audio recorded');
      };
    } catch (err) {
      throw err;
    }
  };

  const cancelRecording = async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
      setIsRecording(false);
      setDuration(0);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  };

  const cleanup = async () => {
    await cancelRecording();
  };

  return {
    startRecording,
    stopRecording,
    transcribeAudio,
    recordAndTranscribe,
    cancelRecording,
    cleanup,
    isRecording,
    isTranscribing,
    transcript,
    duration,
    error,
  };
}
