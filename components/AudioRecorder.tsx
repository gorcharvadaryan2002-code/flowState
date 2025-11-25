import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Download } from 'lucide-react';
import Visualizer from './Visualizer';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  existingAudioUrl?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, existingAudioUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        
        // Stop all tracks
        audioStream.getTracks().forEach(track => track.stop());
        setStream(null);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null); // Clear previous if re-recording
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone permission denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-2">
         <h3 className="text-xl font-bold text-white">Vocal Booth</h3>
         <span className="text-xs text-gray-500 uppercase tracking-widest">{isRecording ? "On Air" : "Standby"}</span>
      </div>

      <Visualizer stream={stream} isRecording={isRecording} />

      <div className="flex items-center justify-center gap-4 mt-4 bg-brand-surface p-4 rounded-xl border border-gray-800">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 transition-all hover:bg-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/30"
          >
             <Mic className="h-6 w-6 text-white" />
             <span className="absolute -inset-1 animate-ping rounded-full bg-red-500 opacity-20 group-hover:opacity-40"></span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 transition-all hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/30"
          >
            <Square className="h-6 w-6 text-white fill-current" />
          </button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-4 w-full justify-between">
             <div className="flex gap-2">
                <audio controls src={audioUrl} className="h-10 w-full max-w-[200px] md:max-w-md bg-transparent" />
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={clearRecording}
                  className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition"
                  title="Discard"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <a 
                  href={audioUrl} 
                  download="flowstate-recording.webm"
                  className="p-3 rounded-full bg-brand-accent hover:bg-violet-500 text-white transition"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </a>
             </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        {isRecording ? "Recording... Sing your heart out!" : "Ready to capture the heat."}
      </div>
    </div>
  );
};

export default AudioRecorder;
