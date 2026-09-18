// Web Audio API Hospital / Airport Chime Synthesizer
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.speechEnabled = true;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  toggleSpeech() {
    this.speechEnabled = !this.speechEnabled;
    return this.speechEnabled;
  }

  // Play pleasant two-tone hospital chime (e.g. F5 -> C5 or A5 -> F5)
  playChime() {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.65);

      // Note 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.25);

      gain2.gain.setValueAtTime(0.001, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.35, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.25);
      osc2.stop(now + 1.25);
    } catch (err) {
      console.warn('Audio chime playback failed:', err);
    }
  }

  // Announce Token via browser Speech Synthesis
  announceToken(displayToken, doctorName, roomNumber) {
    if (this.isMuted) return;

    // First ring chime
    this.playChime();

    if (!this.speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    setTimeout(() => {
      try {
        const text = `Token number ${displayToken}. Please proceed to ${roomNumber}, ${doctorName}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 0.9;
        window.speechSynthesis.cancel(); // cancel pending speech
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis failed:', err);
      }
    }, 600);
  }
}

export const soundController = new SoundController();
