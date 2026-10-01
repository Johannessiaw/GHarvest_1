import React, { useEffect, useRef } from 'react';
import { VoiceState } from '../services/voiceEngine';

interface KofiWaveformProps {
  voiceState: VoiceState;
  frequencies?: Uint8Array;
  height?: number;
  className?: string;
  isCompact?: boolean;
}

export const KofiWaveform: React.FC<KofiWaveformProps> = ({
  voiceState,
  frequencies,
  height = 80,
  className = '',
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Handle high DPI
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const currentHeight = canvas.clientHeight || height;

      if (canvas.width !== width * dpr || canvas.height !== currentHeight * dpr) {
        canvas.width = width * dpr;
        canvas.height = currentHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, currentHeight);

      // Phase progression
      let speed = 0.035;
      if (voiceState === 'speaking') speed = 0.065;
      if (voiceState === 'listening') speed = 0.055;
      if (voiceState === 'processing') speed = 0.08;
      if (voiceState === 'idle') speed = 0.018;
      if (voiceState === 'interrupted') speed = 0.01;

      phaseRef.current += speed;
      const phase = phaseRef.current;

      // Base amplitude calculation
      let volume = 0;
      if (frequencies && frequencies.length > 0) {
        let sum = 0;
        const count = Math.min(frequencies.length, 32);
        for (let i = 0; i < count; i++) {
          sum += frequencies[i];
        }
        volume = sum / (count * 255); // 0.0 to 1.0
      }

      let maxAmp = currentHeight * 0.28;
      if (isCompact) maxAmp = currentHeight * 0.22;

      let targetAmp = 4;
      if (voiceState === 'idle') targetAmp = 5;
      else if (voiceState === 'standby') targetAmp = 7;
      else if (voiceState === 'listening') targetAmp = Math.max(12, volume * maxAmp * 1.5 + 8);
      else if (voiceState === 'processing') targetAmp = 10 + Math.sin(phase * 2) * 5;
      else if (voiceState === 'speaking') targetAmp = Math.max(16, volume * maxAmp * 1.6 + 14);
      else if (voiceState === 'interrupted') targetAmp = 2;

      const centerY = currentHeight / 2;

      // Create glowing neon gradient: neon blue (#00f0ff), violet (#8a2be2), soft pink (#ff69b4)
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0.0, '#00f0ff'); // Neon Blue
      gradient.addColorStop(0.2, '#00d2ff');
      gradient.addColorStop(0.5, '#8a2be2'); // Violet
      gradient.addColorStop(0.8, '#d946ef');
      gradient.addColorStop(1.0, '#ff69b4'); // Soft Pink

      // Draw 3 superimposed harmonic curves for organic fluid look
      const waves = [
        { freq: 0.014, ampMult: 1.0, phaseShift: 0, lineWidth: isCompact ? 2.5 : 3.5, alpha: 0.95 },
        { freq: 0.022, ampMult: 0.75, phaseShift: 1.8, lineWidth: isCompact ? 1.5 : 2.5, alpha: 0.7 },
        { freq: 0.009, ampMult: 0.5, phaseShift: 3.4, lineWidth: isCompact ? 1.0 : 1.8, alpha: 0.5 },
      ];

      for (const w of waves) {
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = w.lineWidth;
        ctx.globalAlpha = w.alpha;

        // Glowing organic shadow
        ctx.shadowColor = 'rgba(138, 43, 226, 0.75)';
        ctx.shadowBlur = isCompact ? 8 : 16;

        for (let x = 0; x <= width; x += 3) {
          // Attenuation envelope so ends taper down smoothly to 0
          const envelope = Math.sin((x / width) * Math.PI);
          // Sine wave combination
          const yOffset =
            Math.sin(x * w.freq + phase + w.phaseShift) * targetAmp * w.ampMult * envelope +
            Math.cos(x * w.freq * 1.5 - phase * 0.7) * (targetAmp * 0.3) * envelope;

          const y = centerY + yOffset;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Center glowing pulse core
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [voiceState, frequencies, height, isCompact]);

  return (
    <div className={`relative w-full flex items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="block"
      />
    </div>
  );
};
