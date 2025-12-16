import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderReturn {
    isRecording: boolean;
    duration: number;
    audioData: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<{ audioData: string; duration: number } | null>;
    cancelRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioData, setAudioData] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            startTimeRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(100);
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<{ audioData: string; duration: number } | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || !isRecording) {
                resolve(null);
                return;
            }

            const mediaRecorder = mediaRecorderRef.current;

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();

                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

                    setAudioData(base64);
                    setIsRecording(false);

                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }

                    // Stop all tracks
                    mediaRecorder.stream.getTracks().forEach(track => track.stop());

                    resolve({ audioData: base64, duration: finalDuration });
                };

                reader.readAsDataURL(blob);
            };

            mediaRecorder.stop();
        });
    }, [isRecording]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        chunksRef.current = [];
        setIsRecording(false);
        setDuration(0);
        setAudioData(null);
    }, [isRecording]);

    return {
        isRecording,
        duration,
        audioData,
        startRecording,
        stopRecording,
        cancelRecording
    };
}
