/**
 * 音效工具 - 科技感音效
 */

export class SoundEffects {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * 生成科技感音效（使用 Web Audio API）
   */
  playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * 悬停音效
   */
  playHover() {
    this.playTone(800, 0.1, 'sine');
    setTimeout(() => this.playTone(1200, 0.15, 'sine'), 50);
  }

  /**
   * 点击音效
   */
  playClick() {
    this.playTone(600, 0.1, 'square');
    setTimeout(() => this.playTone(1000, 0.2, 'square'), 30);
    setTimeout(() => this.playTone(1500, 0.1, 'sine'), 80);
  }

  /**
   * 成功音效
   */
  playSuccess() {
    this.playTone(523, 0.1, 'sine');  // C5
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);  // E5
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 200);  // G5
  }

  /**
   * 错误音效
   */
  playError() {
    this.playTone(200, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.2, 'sawtooth'), 150);
  }
}

// 全局单例
let soundEffects: SoundEffects | null = null;

export function getSoundEffects(): SoundEffects {
  if (!soundEffects) {
    soundEffects = new SoundEffects();
  }
  return soundEffects;
}
