import React, { useRef, useState } from 'react';
import { ingredientsAPI } from '../utils/api';

const ImgBtn = ({ onImageSelect, disabled, addToast }) => {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  function openCamera() {
    // Try to use device camera directly if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      openNativeCamera();
    } else {
      // Fallback to file input with capture attribute
      if (cameraRef.current) {
        cameraRef.current.value = "";
        cameraRef.current.click();
      }
    }
  }

  async function openNativeCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      streamRef.current = stream;
      setShowCamera(true);
      addToast('📷 Point camera at food ingredients', 'info');
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        addToast('🎥 Camera permission denied. Please allow camera access.', 'error');
      } else if (err.name === 'NotFoundError') {
        addToast('📷 No camera found on this device.', 'warn');
      } else {
        addToast('⚠️ Camera not available. Use upload instead.', 'warn');
      }
      // Fallback to file input
      if (cameraRef.current) {
        cameraRef.current.value = "";
        cameraRef.current.click();
      }
    }
  }

  function startCamera() {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }

  function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          processFile(file);
          closeCamera();
        } else {
          addToast('Failed to capture photo', 'error');
        }
      }, 'image/jpeg');
    }
  }

  function closeCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }

  function openUpload() {
    if (uploadRef.current) {
      uploadRef.current.value = '';
      uploadRef.current.click();
    }
  }

  async function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'warn');
      return;
    }

    setBusy(true);
    addToast('🔍 Scanning image for ingredients...', 'info');

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target.result.split(',')[1]);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });

      const preview = URL.createObjectURL(file);

      let ingredients = [];
      try {
        const data = await ingredientsAPI.detectFromImage(file);
        ingredients = data.ingredients || [];
        if (ingredients.length > 0) {
          addToast(`✅ Detected ${ingredients.length} ingredient(s)`, 'success');
        } else {
          addToast('No ingredients detected. Add them manually.', 'warn');
        }
      } catch {
        // Backend unavailable — still show preview, let user add manually
        addToast('⚠️ AI detection unavailable. Image loaded — add ingredients manually.', 'warn');
      }

      onImageSelect({ base64, mimeType: file.type, preview, ingredients });

    } catch {
      addToast('Could not read image file. Try again.', 'warn');
    }

    setBusy(false);
  }

  const btnStyle = (color = '#4a6280') => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 3,
    width: 52, height: 52, borderRadius: 12,
    border: `1.5px solid ${busy ? '#1a3350' : color + '44'}`,
    background: busy ? '#0d1520' : color + '12',
    color: busy ? '#4a6280' : color,
    cursor: busy || disabled ? 'not-allowed' : 'pointer',
    fontSize: 20, fontWeight: 700, transition: 'all .2s',
    opacity: busy || disabled ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', gap: '8px' }}>

      {/* CAMERA BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <button onClick={openCamera} disabled={disabled || busy} style={btnStyle('#0ea5e9')}>
          {busy
            ? <div style={{ width: 16, height: 16, border: '2px solid #818cf8',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 1s linear infinite' }} />
            : '📷'}
        </button>
        <span style={{ fontSize: 8, color: '#4a6280', fontWeight: 700 }}>Camera</span>
      </div>

      {/* Hidden file input for fallback */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = '';
        }}
      />

      {/* UPLOAD BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <button onClick={openUpload} disabled={disabled || busy} style={btnStyle('#818cf8')}>
          🖼️
        </button>
        <span style={{ fontSize: 8, color: '#4a6280', fontWeight: 700 }}>Upload</span>
      </div>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = '';
        }}
      />

      {/* CAMERA MODAL OVERLAY */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Camera feed container */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            aspectRatio: '3/4'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onLoadedMetadata={startCamera}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Control buttons */}
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '40px'
          }}>
            {/* Close button */}
            <button
              onClick={closeCamera}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: 'none',
                background: '#ef4444',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                border: '4px solid white',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}
            >
              ⭕
            </button>

            {/* Spacer for balance */}
            <div style={{ width: '50px' }} />
          </div>

          <p style={{
            marginTop: '20px',
            color: 'white',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            📷 Point camera at ingredients
          </p>
        </div>
      )}

      {/* UPLOAD BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <button onClick={openUpload} disabled={disabled || busy} style={btnStyle('#818cf8')}>
          🖼️
        </button>
        <span style={{ fontSize: 8, color: '#4a6280', fontWeight: 700 }}>Upload</span>
      </div>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = '';
        }}
      />

    </div>
  );
};

export default ImgBtn;
