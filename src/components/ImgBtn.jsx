import React, { useRef, useState } from 'react';
import { ingredientsAPI } from '../utils/api';

const ImgBtn = ({ onImageSelect, disabled, addToast }) => {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('⚠️ Please select an image file', 'warn');
      return;
    }

    setIsProcessing(true);
    addToast('🔍 AI scanning ingredients…', 'info');

    try {
      // Read as base64 for preview
      const preview = URL.createObjectURL(file);

      // Call backend API for ingredient detection
      const data = await ingredientsAPI.detectFromImage(file);
      const ingredients = data.ingredients || [];

      if (ingredients.length === 0) {
        addToast('🔍 No ingredients found. Try a clearer photo.', 'warn');
        setIsProcessing(false);
        return;
      }

      // Read base64 for potential AI chat use
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      onImageSelect({
        base64,
        mimeType: file.type,
        preview,
        ingredients
      });

      addToast(
        `✅ ${ingredients.length} ingredient${ingredients.length > 1 ? 's' : ''} detected!`,
        'success'
      );

    } catch (err) {
      console.error('Image detection error:', err);
      addToast(err.message || '⚠️ Detection failed. Try again.', 'error');
    }

    setIsProcessing(false);
  };

  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
      uploadInputRef.current.click();
    }
  };

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleUploadChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {/* Camera Button */}
      <button
        onClick={handleCameraClick}
        disabled={disabled || isProcessing}
        title="Take a photo with camera"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          border: '1.5px solid #1a3350',
          background: isProcessing ? '#1a3350' : '#1a335018',
          color: isProcessing ? '#4a6280' : '#4a6280',
          cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isProcessing ? (
          <div style={{
            width: '18px',
            height: '18px',
            border: '2px solid #818cf8',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : '📷'}
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleCameraChange}
      />

      {/* Upload Button */}
      <button
        onClick={handleUploadClick}
        disabled={disabled || isProcessing}
        title="Upload a food photo"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          border: '1.5px solid #1a3350',
          background: '#1a335018',
          color: '#4a6280',
          cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        🖼️
      </button>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadChange}
      />
    </div>
  );
};

export default ImgBtn;
