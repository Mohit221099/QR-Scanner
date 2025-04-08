import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ScannerView() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null); // null = checking
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Initialize camera and QR scanner
  useEffect(() => {
    let stream: MediaStream | null = null;
    let detector: BarcodeDetector | null = null;
    let animationFrameId: number;

    const initializeScanner = async () => {
      // Check if BarcodeDetector is supported
      if (!('BarcodeDetector' in window)) {
        setError('QR code scanning is not supported in this browser. Please use Chrome or Edge.');
        setHasCamera(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        setHasCamera(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          detector = new BarcodeDetector({ formats: ['qr_code'] });
          scanQRCode();
        }
      } catch (err) {
        console.error('Camera initialization failed:', err);
        setHasCamera(false);
        setError('Camera access denied or not available');
      }
    };

    const scanQRCode = async () => {
      if (videoRef.current && canvasRef.current && detector) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw video frame to canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        try {
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue;
            setScanResult(qrData);
            navigate('/confirmation', { state: { qrData } });
            return; // Stop scanning after successful detection
          }
        } catch (err) {
          console.error('QR detection error:', err);
          setError('Error scanning QR code');
        }

        // Continue scanning
        animationFrameId = requestAnimationFrame(scanQRCode);
      }
    };

    initializeScanner();

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [navigate]);

  // Retry camera access
  const retryCamera = async () => {
    setError(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCamera(true);
      }
    } catch (err) {
      setHasCamera(false);
      setError('Camera access still unavailable');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Scan QR Code</h2>
        {hasCamera === null ? (
          <div className="text-center text-gray-600">Checking camera availability...</div>
        ) : hasCamera ? (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              muted
              playsInline
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <Camera className="h-6 w-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error || 'Camera access is required. Please enable it in your browser settings.'}
                </p>
                <button
                  onClick={retryCamera}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry Camera Access
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
