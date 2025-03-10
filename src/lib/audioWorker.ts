import * as Comlink from 'comlink';

class AudioProcessor {
  private kalmanGain: number = 0.5;
  private nlmsStepSize: number = 0.1;
  private filterLength: number = 1024;
  private echoDelay: number = 100;
  private echoIntensity: number = 50;

  setParameters(params: {
    kalmanGain?: number;
    nlmsStepSize?: number;
    filterLength?: number;
    echoDelay?: number;
    echoIntensity?: number;
  }) {
    if (params.kalmanGain !== undefined) this.kalmanGain = params.kalmanGain;
    if (params.nlmsStepSize !== undefined) this.nlmsStepSize = params.nlmsStepSize;
    if (params.filterLength !== undefined) this.filterLength = params.filterLength;
    if (params.echoDelay !== undefined) this.echoDelay = params.echoDelay;
    if (params.echoIntensity !== undefined) this.echoIntensity = params.echoIntensity;
  }

  async addEcho(audioData: Float32Array): Promise<Float32Array> {
    const delayInSamples = Math.floor(this.echoDelay * 44.1); // assuming 44.1kHz sample rate
    const intensity = this.echoIntensity / 100;
    
    const output = new Float32Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      output[i] = audioData[i];
      if (i >= delayInSamples) {
        output[i] += audioData[i - delayInSamples] * intensity;
      }
    }

    return output;
  }

  async removeEcho(audioData: Float32Array): Promise<Float32Array> {
    return this.applyNLMSFilter(audioData);
  }

  async processNoiseAndEcho(audioData: Float32Array): Promise<Float32Array> {
    const denoised = this.applyKalmanFilter(audioData);
    return this.applyNLMSFilter(denoised);
  }

  private applyKalmanFilter(input: Float32Array): Float32Array {
    const output = new Float32Array(input.length);
    let estimate = 0;
    let errorCovariance = 1;
    
    for (let i = 0; i < input.length; i++) {
      // Prediction
      const prediction = estimate;
      errorCovariance += 0.001; // Process noise

      // Update
      const kalmanGain = errorCovariance / (errorCovariance + this.kalmanGain);
      estimate = prediction + kalmanGain * (input[i] - prediction);
      errorCovariance = (1 - kalmanGain) * errorCovariance;

      output[i] = estimate;
    }

    return output;
  }

  private applyNLMSFilter(input: Float32Array): Float32Array {
    const output = new Float32Array(input.length);
    const weights = new Float32Array(this.filterLength).fill(0);
    const buffer = new Float32Array(this.filterLength).fill(0);
    
    for (let i = 0; i < input.length; i++) {
      // Update buffer
      buffer.copyWithin(1, 0);
      buffer[0] = input[i];

      // Calculate output
      let y = 0;
      for (let j = 0; j < this.filterLength; j++) {
        y += weights[j] * buffer[j];
      }
      output[i] = y;

      // Update weights
      const error = input[i] - y;
      let powerSpectrum = 0;
      for (let j = 0; j < this.filterLength; j++) {
        powerSpectrum += buffer[j] * buffer[j];
      }
      
      const normalizedStepSize = this.nlmsStepSize / (powerSpectrum + 1e-10);
      for (let j = 0; j < this.filterLength; j++) {
        weights[j] += normalizedStepSize * error * buffer[j];
      }
    }

    return output;
  }
}

Comlink.expose(AudioProcessor);