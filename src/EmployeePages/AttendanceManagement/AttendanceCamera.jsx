import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

const AttendanceCamera = ({
  photoSubmitted,
  setPhotoSubmitted,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // START CAMERA
  const startCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStarted(true);
    } catch (error) {
      console.log(error);

      alert(
        "Unable to access camera. Please allow camera permission."
      );
    }
  };

  // STOP CAMERA
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  };

  // CAPTURE PHOTO
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image =
      canvas.toDataURL("image/png");

    setCapturedImage(image);

    // Camera OFF after capture
    stopCamera();
  };

  // RETAKE PHOTO
  const retakePhoto = async () => {
    setCapturedImage(null);
    setPhotoSubmitted(false);

    await startCamera();
  };

  // SUBMIT PHOTO
  const submitPhoto = async () => {
    try {
      setLoading(true);

      if (capturedImage) {
        localStorage.setItem("userSelfie", capturedImage);
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      if (typeof setPhotoSubmitted === "function") {
        setPhotoSubmitted(capturedImage || true);
      }

      alert(
        "Attendance photo submitted successfully"
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // CLEANUP
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full">

      {/* CAMERA BOX */}
      <motion.div
        layout
        className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-slate-100"
      >
        {!capturedImage ? (
          <div className="relative h-[320px]">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {!cameraStarted && (
              <div className="absolute inset-0 flex items-center justify-center">

                <div className="text-center">

                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <Camera
                      size={40}
                      className="text-gray-400"
                    />
                  </div>

                  <p className="mt-5 text-2xl text-gray-500">
                    Camera preview will appear here
                  </p>

                  <p className="text-gray-400 mt-2">
                    Click "Start Camera" to begin
                  </p>

                </div>

              </div>
            )}

          </div>
        ) : (
          <img
            src={capturedImage}
            alt="Attendance"
            className="w-full h-[320px] object-cover"
          />
        )}
      </motion.div>

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* BUTTON SECTION */}
      <div className="mt-6">

        {!cameraStarted &&
          !capturedImage && (
            <button
              onClick={startCamera}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-semibold text-lg transition"
            >
              Start Camera
            </button>
          )}

        {cameraStarted &&
          !capturedImage && (
            <button
              onClick={capturePhoto}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg transition"
            >
              Capture Photo
            </button>
          )}

        {capturedImage &&
          !photoSubmitted && (
            <div className="flex gap-3">

              <button
                onClick={retakePhoto}
                className="flex-1 flex h-10 items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold transition"
              >
                <RefreshCw size={18} />
                Retake
              </button>

              <button
                onClick={submitPhoto}
                disabled={loading}
                className="flex-1 flex items-center w-10 h-10 justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-sm transition"
              >
                <CheckCircle2 size={18} />

                {loading
                  ? "Submitting..."
                  : "Submit Photo"}
              </button>

            </div>
          )}

        {photoSubmitted && (
          <div className="w-full h-[67px] border border-black/20 bg-green-100 text-green-700 py-4 rounded-xl text-center font-semibold">
           <p> ✅ Attendance Photo Submitted Successfully</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default AttendanceCamera;