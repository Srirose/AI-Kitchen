import React, { useRef, useState } from 'react';
import { ingredientsAPI } from '../utils/api';

const ImgBtn = ({ onImageSelect, disabled, addToast }) => {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);
  const [busy, setBusy] = useState(false);

  function openCamera() {
    if (cameraRef.current) {
      cameraRef.current.value = "";
      cameraRef.current.click();
    }
  }

  function openUpload() {
    if (uploadRef.current) {
      uploadRef.current.value = "";
      uploadRef.current.click();
    }
  }

  async function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast({ type: "warn", icon: "⚠️", title: "Invalid file",
                 body: "Please select an image file." });
      return;
    }

    setBusy(true);
    addToast({ type: "info", icon: "🔍", title: "Scanning image…",
               body: "AI detecting visible ingredients only." });

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target.result.split(",")[1]);
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
      });

      const preview = URL.createObjectURL(file);
      const data = await ingredientsAPI.detectFromImage(file);
      const ingredients = data.ingredients || [];
      
      onImageSelect({ base64, mimeType: file.type, preview, ingredients });

    } catch {
      addToast({ type: "warn", icon: "⚠️", title: "Failed",
                 body: "Could not process image. Try again." });
    }

    setBusy(false);
  }

  const btnStyle = (color = "#4a6280") => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 3,
    width: 52, height: 52, borderRadius: 12,
    border: `1.5px solid ${busy ? "#1a3350" : color + "44"}`,
    background: busy ? "#0d1520" : color + "12",
    color: busy ? "#4a6280" : color,
    cursor: busy || disabled ? "not-allowed" : "pointer",
    fontSize: 20, fontWeight: 700, transition: "all .2s",
    opacity: busy || disabled ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', gap: '8px' }}>

      {/* LIVE CAMERA BUTTON */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <button onClick={openCamera} disabled={disabled || busy} style={btnStyle("#0ea5e9")}>
          {busy
            ? <div style={{ width: 16, height: 16, border: "2px solid #818cf8",
                            borderTopColor: "transparent", borderRadius: "50%",
                            animation: "spin 1s linear infinite" }} />
            : "📷"}
        </button>
        <span style={{ fontSize: 8, color: "#4a6280", fontWeight: 700 }}>Camera</span>
      </div>

      {/* HIDDEN CAMERA INPUT — opens live camera */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = "";
        }}
      />

      {/* UPLOAD BUTTON */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <button onClick={openUpload} disabled={disabled || busy} style={btnStyle("#818cf8")}>
          🖼️
        </button>
        <span style={{ fontSize: 8, color: "#4a6280", fontWeight: 700 }}>Upload</span>
      </div>

      {/* HIDDEN UPLOAD INPUT — file picker, no camera */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = "";
        }}
      />

    </div>
  );
};

export default ImgBtn;
