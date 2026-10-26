/**
 * Local Audio DSP & Acoustic Feature Extraction Engine
 * Computes 16kHz PCM Framing, Windowing, FFT, Mel Filterbank, MFCCs, and Voice Activity Detection (VAD)
 * Runs 100% locally in browser and Node.js with zero external dependencies or APIs.
 * @license Apache-2.0
 */

export interface AudioFeatures {
  energy: number;
  isSpeech: boolean;
  zeroCrossingRate: number;
  spectralFlux: number;
  spectralCentroid: number;
  mfcc: number[];
  melSpectrogram: number[];
}

export class LocalAudioDsp {
  private static readonly SAMPLE_RATE = 16000;
  private static readonly FRAME_SIZE = 400; // 25ms at 16kHz
  private static readonly HOP_SIZE = 160;    // 10ms at 16kHz
  private static readonly NUM_MEL_BANDS = 40;
  private static readonly NUM_MFCC = 13;
  private static readonly HAMMING_WINDOW: Float32Array = LocalAudioDsp.createHammingWindow(400);

  // Precomputed Mel filterbank matrix (40 filters over 256 FFT bins)
  private static melFilterbank: Float32Array[] | null = null;
  private static dctMatrix: Float32Array[] | null = null;

  private static createHammingWindow(size: number): Float32Array {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (size - 1));
    }
    return window;
  }

  private static hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  private static melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  /**
   * Initializes Mel filterbank and DCT projection matrices
   */
  private static initMatrices(): void {
    if (this.melFilterbank && this.dctMatrix) return;

    const fftSize = 512;
    const numBins = fftSize / 2 + 1; // 257 bins
    const minMel = this.hzToMel(80);
    const maxMel = this.hzToMel(this.SAMPLE_RATE / 2);

    const melPoints = new Float32Array(this.NUM_MEL_BANDS + 2);
    for (let i = 0; i < this.NUM_MEL_BANDS + 2; i++) {
      melPoints[i] = minMel + (i / (this.NUM_MEL_BANDS + 1)) * (maxMel - minMel);
    }

    const binIndices = new Int32Array(this.NUM_MEL_BANDS + 2);
    for (let i = 0; i < this.NUM_MEL_BANDS + 2; i++) {
      const hz = this.melToHz(melPoints[i]);
      binIndices[i] = Math.min(numBins - 1, Math.floor(((fftSize + 1) * hz) / this.SAMPLE_RATE));
    }

    this.melFilterbank = [];
    for (let m = 1; m <= this.NUM_MEL_BANDS; m++) {
      const filter = new Float32Array(numBins);
      const start = binIndices[m - 1];
      const center = binIndices[m];
      const end = binIndices[m + 1];

      for (let k = start; k < center; k++) {
        filter[k] = (k - start) / Math.max(1, center - start);
      }
      for (let k = center; k < end; k++) {
        filter[k] = (end - k) / Math.max(1, end - center);
      }
      this.melFilterbank.push(filter);
    }

    // Discrete Cosine Transform (DCT-II) matrix
    this.dctMatrix = [];
    for (let i = 0; i < this.NUM_MFCC; i++) {
      const row = new Float32Array(this.NUM_MEL_BANDS);
      for (let j = 0; j < this.NUM_MEL_BANDS; j++) {
        row[j] = Math.cos((Math.PI * i * (j + 0.5)) / this.NUM_MEL_BANDS);
      }
      this.dctMatrix.push(row);
    }
  }

  /**
   * Apply pre-emphasis filter to boost high-frequency acoustic formants
   */
  public static preEmphasis(pcm: Float32Array, alpha = 0.97): Float32Array {
    const out = new Float32Array(pcm.length);
    if (pcm.length === 0) return out;
    out[0] = pcm[0];
    for (let i = 1; i < pcm.length; i++) {
      out[i] = pcm[i] - alpha * pcm[i - 1];
    }
    return out;
  }

  /**
   * Radix-2 Real FFT for 512 points
   */
  public static computePowerSpectrum(frame: Float32Array): Float32Array {
    const n = 512;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);

    // Copy windowed frame into real buffer
    const len = Math.min(frame.length, this.FRAME_SIZE);
    for (let i = 0; i < len; i++) {
      real[i] = frame[i] * this.HAMMING_WINDOW[i];
    }

    // Bit reversal permutation
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tempR = real[i];
        real[i] = real[j];
        real[j] = tempR;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    // Cooley-Tukey Radix-2 FFT
    for (let lenStep = 2; lenStep <= n; lenStep <<= 1) {
      const halfLen = lenStep >> 1;
      const angle = (-2 * Math.PI) / lenStep;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < n; i += lenStep) {
        let wR = 1;
        let wI = 0;
        for (let m = 0; m < halfLen; m++) {
          const uR = real[i + m];
          const uI = imag[i + m];
          const vR = real[i + m + halfLen] * wR - imag[i + m + halfLen] * wI;
          const vI = real[i + m + halfLen] * wI + imag[i + m + halfLen] * wR;

          real[i + m] = uR + vR;
          imag[i + m] = uI + vI;
          real[i + m + halfLen] = uR - vR;
          imag[i + m + halfLen] = uI - vI;

          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }

    // Power spectrum |X(k)|^2 / N for 257 unique positive frequency bins
    const numBins = n / 2 + 1;
    const power = new Float32Array(numBins);
    for (let k = 0; k < numBins; k++) {
      power[k] = (real[k] * real[k] + imag[k] * imag[k]) / n;
    }
    return power;
  }

  /**
   * Computes Mel-Frequency Cepstral Coefficients (MFCCs) and log-mel energies
   */
  public static extractFrameFeatures(
    frame: Float32Array,
    prevPowerSpec?: Float32Array
  ): AudioFeatures {
    this.initMatrices();
    const powerSpec = this.computePowerSpectrum(frame);

    // Energy & Zero Crossing Rate
    let energy = 0;
    let zcrCount = 0;
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i];
      if (i > 0 && ((frame[i] >= 0 && frame[i - 1] < 0) || (frame[i] < 0 && frame[i - 1] >= 0))) {
        zcrCount++;
      }
    }
    const rms = Math.sqrt(energy / Math.max(1, frame.length));
    const zcr = zcrCount / Math.max(1, frame.length);

    // Apply Mel filterbank
    const melEnergies = new Float32Array(this.NUM_MEL_BANDS);
    for (let m = 0; m < this.NUM_MEL_BANDS; m++) {
      const filter = this.melFilterbank![m];
      let sum = 1e-10; // epsilon
      for (let k = 0; k < powerSpec.length; k++) {
        sum += filter[k] * powerSpec[k];
      }
      melEnergies[m] = Math.log(sum);
    }

    // DCT projection to obtain 13 MFCC coefficients
    const mfcc = new Float32Array(this.NUM_MFCC);
    for (let i = 0; i < this.NUM_MFCC; i++) {
      let sum = 0;
      const row = this.dctMatrix![i];
      for (let j = 0; j < this.NUM_MEL_BANDS; j++) {
        sum += row[j] * melEnergies[j];
      }
      mfcc[i] = sum;
    }

    // Spectral Flux & Centroid
    let spectralFlux = 0;
    let weightedFreqSum = 0;
    let totalPower = 0;
    for (let k = 0; k < powerSpec.length; k++) {
      totalPower += powerSpec[k];
      weightedFreqSum += k * powerSpec[k];
      if (prevPowerSpec) {
        const diff = Math.max(0, powerSpec[k] - prevPowerSpec[k]);
        spectralFlux += diff * diff;
      }
    }
    const spectralCentroid = totalPower > 0 ? (weightedFreqSum / totalPower) * (this.SAMPLE_RATE / 512) : 0;

    // Local Voice Activity Detection (VAD)
    // Speech typically exhibits RMS > 0.015, ZCR between 0.02 and 0.45, and energy concentrated in voice formant range
    const isSpeech = rms > 0.014 && (spectralCentroid > 250 && spectralCentroid < 3800);

    return {
      energy: Number(rms.toFixed(4)),
      isSpeech,
      zeroCrossingRate: Number(zcr.toFixed(4)),
      spectralFlux: Number(Math.sqrt(spectralFlux).toFixed(4)),
      spectralCentroid: Math.round(spectralCentroid),
      mfcc: Array.from(mfcc).map((v) => Number(v.toFixed(3))),
      melSpectrogram: Array.from(melEnergies).map((v) => Number(v.toFixed(2))),
    };
  }

  /**
   * Resamples any arbitrary audio buffer (e.g. 44.1kHz or 48kHz from browser mic) to 16kHz
   */
  public static resampleTo16kHz(audio: Float32Array, inputSampleRate: number): Float32Array {
    if (inputSampleRate === 16000) return audio;
    const ratio = inputSampleRate / 16000;
    const newLen = Math.floor(audio.length / ratio);
    const output = new Float32Array(newLen);

    for (let i = 0; i < newLen; i++) {
      const srcIdx = i * ratio;
      const index = Math.floor(srcIdx);
      const frac = srcIdx - index;
      const s0 = audio[index] || 0;
      const s1 = audio[index + 1] || s0;
      output[i] = s0 + frac * (s1 - s0); // Linear interpolation
    }
    return output;
  }
}
