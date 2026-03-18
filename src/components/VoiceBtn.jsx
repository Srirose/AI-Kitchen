import React, { useState, useRef } from 'react';

const VoiceBtn = ({ onTranscript, disabled, addToast }) => {
  const [rec, setRec] = useState(false);
  const recRef = useRef(null);

  async function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      addToast('Voice not supported. Use Chrome or Edge.', 'warn');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch {
      addToast('Microphone access denied. Allow mic in browser settings and try again.', 'warn');
      return;
    }

    try {
      const r = new SR();
      r.continuous      = false;
      r.interimResults  = false;
      r.lang            = 'en-IN';
      r.maxAlternatives = 1;

      r.onstart = () => setRec(true);

      r.onend = () => {
        setRec(false);
        recRef.current = null;
      };

      r.onerror = ev => {
        setRec(false);
        recRef.current = null;
        const msgs = {
          'not-allowed':   'Allow microphone in browser settings and try again.',
          'no-speech':     'No speech detected. Please speak clearly.',
          'audio-capture': 'No microphone found. Connect one and try again.',
          'network':       'Network error. Check your connection.',
        };
        if (ev.error !== 'aborted') {
          addToast(msgs[ev.error] || `Voice error: ${ev.error}`, 'warn');
        }
      };

      r.onresult = ev => {
        const transcript = ev.results[0][0].transcript;
        onTranscript(transcript);
        addToast(`🎤 Heard: "${transcript}"`, 'success');
      };

      recRef.current = r;
      r.start();
    } catch {
      addToast('Could not start voice recognition.', 'warn');
      setRec(false);
    }
  }

  function stopVoice() {
    if (recRef.current) {
      recRef.current.stop();
    }
  }

  const handleClick = () => {
    if (rec) {
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
        background: rec 
          ? 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        boxShadow: rec ? '0 0 20px rgba(248, 113, 113, 0.5)' : 'none',
        opacity: disabled ? 0.5 : 1
      }}
    >
      {rec ? (
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
