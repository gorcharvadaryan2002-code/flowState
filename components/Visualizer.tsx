import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ stream, isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const audioContextRef = useRef<AudioContext>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioCtx = audioContextRef.current;
    analyserRef.current = audioCtx.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    sourceRef.current = audioCtx.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (!isRecording) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
         // Draw idle line
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, canvas.height / 2);
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.strokeStyle = '#374151';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        return;
      }

      analyserRef.current!.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = '#1c1c23'; // Background match
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Gradient
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#a78bfa');
        gradient.addColorStop(1, '#8b5cf6');

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (sourceRef.current) sourceRef.current.disconnect();
      // Don't close AudioContext to allow re-use easily, or manage state carefully in parent
    };
  }, [stream, isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={150} 
      className="w-full h-32 bg-brand-surface rounded-lg border border-gray-800"
    />
  );
};

export default Visualizer;
