import React, { useState, useRef } from 'react';

const VoiceBtn = ({ onTranscript, disabled, addToast }) => {
  const [rec, setRec] = useState(false);
  const recRef = useRef(null);

  async function startVoice() {
    // Step 1 — browser support check
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      addToast({
        type: "warn", icon: "🎤",
        title: "Voice not supported",
        body: "Please use Chrome or Edge browser.",
      });
      return;
    }

    // Step 2 — explicitly request mic permission FIRST
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // release immediately
    } catch {
      addToast({
        type: "warn", icon: "🎤",
        title: "Microphone access denied",
        body: "Tap the 🔒 icon in your browser address bar → allow Microphone → try again.",
      });
      return;
    }

    // Step 3 — setup recognition
    try {
      const r = new SR();
      r.continuous      = false;
      r.interimResults  = false;
      r.lang            = "en-IN";
      r.maxAlternatives = 1;

      // Step 4 — attach ALL handlers BEFORE start()
      r.onstart = () => setRec(true);

      r.onend = () => {
        setRec(false);
        recRef.current = null;
      };

      r.onerror = ev => {
        setRec(false);
        recRef.current = null;
        const msgs = {
          "not-allowed":   "Allow microphone in browser settings and try again.",
          "no-speech":     "No speech detected. Please speak clearly.",
          "audio-capture": "No microphone found. Connect one and try again.",
          "network":       "Network error. Check your connection.",
        };
        const msg = msgs[ev.error] || `Voice error: ${ev.error}`;
        if (ev.error !== "aborted") {
          addToast({
            type: "warn", icon: "🎤",
            title: "Voice error",
            body: msg,
          });
        }
      };

      r.onresult = ev => {
        const transcript = ev.results[0][0].transcript;
        onTranscript(transcript);
        addToast({
          type: "success", icon: "✅",
          title: "Heard",
          body: `"${transcript}"`,
        });
      };

      // Step 5 — store ref and start
      recRef.current = r;
      r.start();

    } catch {
      addToast({
        type: "warn", icon: "🎤",
        title: "Failed to start",
        body: "Could not start voice recognition.",
      });
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
