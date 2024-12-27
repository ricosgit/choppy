'use client'
import { useEffect, useRef, useState } from 'react';

const IndexPage = () => {
  const audioContext= useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const bufferLength = useRef<number | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showRandomImage, setShowRandomImage] = useState<boolean>(false);

  const initAudioContext = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext();
      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      source.connect(analyser.current);
      analyser.current.connect(audioContext.current.destination);
      analyser.current.fftSize = 256;
      bufferLength.current = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(bufferLength.current);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const getMicrophoneVolume = (): number => {
    if (!analyser.current || !dataArray.current || bufferLength.current === null) return 0;

    analyser.current.getByteFrequencyData(dataArray.current);

    // 正規化: dataArrayの最大値が255なので、それで割って0から1の範囲に変換
    const normalizedVolume = dataArray.current.reduce(
      (acc, value) => acc + value, 0
    ) / (bufferLength.current * 255);

    return normalizedVolume;
  };

  const handleMicrophoneVolumeChange = (): void => {
    const volume = getMicrophoneVolume();
    // console.log('Microphone Volume:', volume);

    // 調整: 低い音でも反応しやすくするために閾値を調整
    const speakingThreshold = 0.08;

    if (volume > speakingThreshold) {
      setIsSpeaking(true);
    } else {
      setIsSpeaking(false);
    }
  };

  const showRandomImageAtRandomIntervals = (): void => {
    const interval = Math.random() * (60000 / 20);
    setTimeout(() => {
      setShowRandomImage(true);
      setTimeout(() => {
        setShowRandomImage(false);
      }, 1000);
      showRandomImageAtRandomIntervals();
    }, interval);
  };

  useEffect(() => {
    initAudioContext();

    return () => {
      if (audioContext.current) {
        audioContext.current.close().catch((error) => {
          console.error('Error closing AudioContext:', error)
        });
      }
    };
  }, []);

  useEffect(() => {
    const updateMicrophoneVolume = () => {
      handleMicrophoneVolumeChange();
    };

    const updateInterval = setInterval(updateMicrophoneVolume, 100);

    return () => {
      clearInterval(updateInterval);

      // AudioContextの終了
      if (audioContext.current) {
        audioContext.current.close().catch((error) =>{
          console.error('Error closing AudioContext:', error);
        })
      }
    };
  }, []);

  useEffect(() => {
    showRandomImageAtRandomIntervals();

    return () => {};
  }, []);

  return (
    <div>
      <h1>Microphone Volume Monitoring</h1>
      {isSpeaking ? (
        <img src="img/Talking_1000.png" alt="Speaking Image" style={{ background: 'green' }} />
      ) : showRandomImage ? (
        <img src="img/Blink_1000.png" alt="Random Image" style={{ background: 'green' }} />
      ) : (
        <img src="img/Normal_1000.png" alt="Default Image" style={{ background: 'green' }} />
      )}
    </div>
  );
};

export default IndexPage;