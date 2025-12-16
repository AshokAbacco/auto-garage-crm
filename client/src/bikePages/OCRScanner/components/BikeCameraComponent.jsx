// client/src/pages/details/components/CameraComponent.jsx
import React, { useRef, useState, useEffect } from "react";
import { FiCamera, FiX, FiRefreshCw, FiZap } from "react-icons/fi";

const CameraComponent = ({ onCapture, onStop }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const [torchEnabled, setTorchEnabled] = useState(false);

    // Start camera
    const startCamera = async (mode = facingMode) => {
        try {
            stopCamera();

            const constraints = {
                video: {
                    facingMode: { ideal: mode },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                await videoRef.current.play();
            }

            setCameraActive(true);
        } catch (err) {
            console.error("Camera start error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    // Capture image
    const captureImage = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        onCapture(imageData);
    };

    // Switch camera
    const switchCamera = async () => {
        const newMode = facingMode === "environment" ? "user" : "environment";
        setFacingMode(newMode);
        await startCamera(newMode);
    };

    // Toggle flashlight (if supported)
    const toggleTorch = async () => {
        try {
            if (!stream) return;
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();

            if (capabilities.torch) {
                const newTorchState = !torchEnabled;
                await track.applyConstraints({
                    advanced: [{ torch: newTorchState }],
                });
                setTorchEnabled(newTorchState);
            } else {
                alert("Flashlight not supported on this device.");
            }
        } catch (err) {
            console.warn("Torch toggle failed:", err);
        }
    };

    useEffect(() => {
        startCamera();
        return () => stopCamera();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Video Stream */}
            <div className="relative rounded-2xl overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-80 object-cover rounded-2xl"
                />
                {/* Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-4 border-white border-dashed rounded-2xl w-5/6 h-5/6 flex items-center justify-center">
                        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <span className="text-white text-sm font-semibold">
                                Position document here
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
                <button
                    onClick={captureImage}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2"
                >
                    <FiCamera size={18} /> Capture
                </button>

                <button
                    onClick={switchCamera}
                    className="px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl flex items-center gap-2"
                >
                    <FiRefreshCw size={18} /> Flip
                </button>

                <button
                    onClick={toggleTorch}
                    className={`px-5 py-3 rounded-xl flex items-center gap-2 ${torchEnabled
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                >
                    <FiZap size={18} /> {torchEnabled ? "Torch On" : "Torch Off"}
                </button>

                <button
                    onClick={() => {
                        stopCamera();
                        onStop?.();
                    }}
                    className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center gap-2"
                >
                    <FiX size={18} /> Stop
                </button>
            </div>
        </div>
    );
};

export default CameraComponent;
