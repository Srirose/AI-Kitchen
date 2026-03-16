/**
 * Web Speech API Voice Input Module
 * Handles voice recognition for ingredient input
 */

class VoiceInput {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.currentButton = null;
    
    // Don't auto-init - wait for user interaction
    this.initialized = false;
  }
  
  /**
   * Initialize Speech Recognition
   */
  init() {
    if (this.initialized) return true;
    
    // Check for Chrome/Edge support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return false;
    }
    
    try {
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      this.recognition.onstart = () => {
        console.log('Voice recognition started');
        this.isListening = true;
        this.updateUIState(true);
      };
      
      this.recognition.onend = () => {
        console.log('Voice recognition ended');
        this.isListening = false;
        this.updateUIState(false);
        this.currentButton = null;
      };
      
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('Voice result:', { final: finalTranscript, interim: interimTranscript });
        
        if (this.onResultCallback) {
          this.onResultCallback({
            final: finalTranscript,
            interim: interimTranscript,
            isFinal: event.results[event.results.length - 1].isFinal
          });
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
        this.isListening = false;
        this.updateUIState(false);
        this.currentButton = null;
      };
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      return false;
    }
  }
  
  /**
   * Start voice recognition for a specific button
   * @param {HTMLElement} button - The voice button clicked
   * @param {Function} onResult - Callback for results
   * @param {Function} onError - Callback for errors
   */
  startForButton(button, onResult, onError) {
    // Initialize if not already
    if (!this.init()) {
      if (onError) onError('Speech recognition not supported. Please use Chrome or Edge browser.');
      return false;
    }
    
    // Stop any existing recognition
    if (this.isListening) {
      this.stop();
    }
    
    this.currentButton = button;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    
    try {
      // Small delay to ensure clean start
      setTimeout(() => {
        this.recognition.start();
      }, 100);
      return true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      if (onError) onError('Could not start voice input. Please try again.');
      return false;
    }
  }
  
  /**
   * Stop voice recognition
   */
  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }
    this.isListening = false;
    this.currentButton = null;
  }
  
  /**
   * Toggle voice recognition for a button
   * @param {HTMLElement} button - The voice button
   * @param {Function} onResult - Callback for results
   * @param {Function} onError - Callback for errors
   */
  toggleForButton(button, onResult, onError) {
    if (this.isListening && this.currentButton === button) {
      this.stop();
      return false;
    } else {
      return this.startForButton(button, onResult, onError);
    }
  }
  
  /**
   * Check if browser supports speech recognition
   * @returns {boolean}
   */
  isSupported() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }
  
  /**
   * Update UI elements to reflect listening state
   * @param {boolean} listening - Whether currently listening
   */
  updateUIState(listening) {
    // Update only the current button if set
    if (this.currentButton) {
      if (listening) {
        this.currentButton.classList.add('listening');
        this.currentButton.innerHTML = '<span class="voice-wave"></span><span class="voice-text">Listening...</span>';
      } else {
        this.currentButton.classList.remove('listening');
        this.currentButton.innerHTML = '🎤 <span class="voice-text">Voice</span>';
      }
    }
  }
}

// Export singleton
export const voiceInput = new VoiceInput();

/**
 * Parse spoken ingredients into array
 * @param {string} transcript - Voice transcript
 * @returns {Array} - Parsed ingredients
 */
export function parseVoiceIngredients(transcript) {
  // Clean up transcript
  const cleaned = transcript
    .toLowerCase()
    .replace(/and/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split by common delimiters
  const ingredients = cleaned
    .split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  return ingredients;
}
