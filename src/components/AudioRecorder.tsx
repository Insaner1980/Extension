import React, { useState, useRef, useEffect } from 'react';
import { addAudioToNote } from '../services/db';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import styles from './AudioRecorder.module.css';

interface AudioRecorderProps {
  noteId: number;
  onTranscriptionComplete: (transcription: string) => void;
}

// Extend Window interface for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ noteId, onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Clean up on unmount
    return () => {
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscription('');
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up MediaRecorder for audio capture
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await handleRecordingComplete();
      };

      // Start MediaRecorder
      mediaRecorder.start();

      // Set up Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update transcription state with both final and interim results
          setTranscription((prev) => {
            const newTranscript = prev + finalTranscript;
            return newTranscript;
          });

          // Show interim results in real-time
          if (interimTranscript) {
            setTranscription((prev) => prev + interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setError(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // Auto-restart if still recording (for continuous recognition)
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Recognition restart failed:', e);
            }
          }
        };

        recognition.start();
      } else {
        setError('Speech recognition not supported in this browser');
      }

      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop Speech Recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleRecordingComplete = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio data recorded');
      return;
    }

    setIsSaving(true);

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      // Save to database
      await addAudioToNote(noteId, audioBlob, transcription.trim());

      // Notify parent component with the transcription
      if (transcription.trim()) {
        onTranscriptionComplete(transcription.trim());
      }

      // Reset state
      setTranscription('');
      audioChunksRef.current = [];
    } catch (err) {
      console.error('Error saving audio:', err);
      setError('Failed to save audio recording');
    } finally {
      setIsSaving(false);
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={styles.audioRecorder}>
      <button
        className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
        onClick={handleButtonClick}
        disabled={isSaving}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isSaving ? (
          <HourglassEmptyIcon className={styles.spinner} sx={{ fontSize: 20 }} />
        ) : isRecording ? (
          <StopIcon className={styles.stopIcon} sx={{ fontSize: 20 }} />
        ) : (
          <MicIcon className={styles.micIcon} sx={{ fontSize: 20 }} />
        )}
      </button>

      {isRecording && (
        <div className={styles.recordingIndicator}>
          <FiberManualRecordIcon className={styles.pulse} sx={{ fontSize: 12, color: '#ef4444' }} />
          <span className={styles.recordingText}>Recording...</span>
        </div>
      )}

      {transcription && isRecording && (
        <div className={styles.liveTranscription}>
          <div className={styles.transcriptionLabel}>Live transcription:</div>
          <div className={styles.transcriptionText}>{transcription}</div>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
