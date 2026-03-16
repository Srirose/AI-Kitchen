import React, { useState, useRef, useCallback } from 'react';

const VoiceBtn = ({ onTranscript, disabled, addToast }) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startVoice = useCallback(async () => {
    // Step 1 — Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('🎤 Voice not supported — please use Chrome or Edge', 'warn');
      return;
    }

    // Step 2 — Request mic permission via getUserMedia FIRST
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch {
      addToast('🎤 Microphone access denied. Please allow mic in browser settings.', 'error');
      return;
    }

    // Step 3 — Create recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    // Step 4 — Attach handlers BEFORE calling start()
    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      recognitionRef.current = null;
      
      if (event.error === 'no-speech') {
        addToast('No speech detected. Try again.', 'warn');
      } else if (event.error === 'audio-capture') {
        addToast('No microphone found. Check your device.', 'error');
      } else if (event.error === 'not-allowed') {
        addToast('Microphone permission denied.', 'error');
      } else if (event.error !== 'aborted') {
        addToast(`Voice error: ${event.error}`, 'error');
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      addToast(`✓ Heard: "${transcript}"`, 'success');
    };

    // Step 5 — Store ref and start
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch {
      addToast('Failed to start voice recognition', 'error');
      setIsRecording(false);
    }
  }, [onTranscript, addToast]);

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const handleClick = () => {
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        background: isRecording 
          ? 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxShadow: isRecording ? '0 0 20px rgba(248, 113, 113, 0.5)' : 'none',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {isRecording ? (
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          height: '20px'
        }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: '100%',
                background: '#fff',
                borderRadius: '2px',
                animation: 'wave 0.8s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      ) : (
        <span style={{ fontSize: '20px' }}>🎤</span>
      )}
    </button>
  );
};

export default VoiceBtn;
