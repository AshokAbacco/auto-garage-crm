import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketProvider";

const BookingPopupContext = createContext();

export const useBookingPopup = () => useContext(BookingPopupContext);

export default function BookingPopupProvider({ children }) {
  const socket = useSocket();
  const [booking, setBooking] = useState(null);

  // 🔊 GLOBAL AUDIO
  const alertAudioRef = useRef(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // ==============================
  // INIT AUDIO
  // ==============================
  useEffect(() => {
    const audio = new Audio("/alert.mp3");
    audio.loop = true;
    audio.preload = "auto";

    alertAudioRef.current = audio;

    console.log("🔊 Audio initialized");

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // ==============================
  // AUTO UNLOCK (NO VISIBLE CLICK)
  // ==============================
  useEffect(() => {
    const unlock = () => {
      if (!alertAudioRef.current) return;

      alertAudioRef.current
        .play()
        .then(() => {
          alertAudioRef.current.pause();
          alertAudioRef.current.currentTime = 0;

          setAudioUnlocked(true);
          console.log("🔓 Audio unlocked (auto)");

          // remove all listeners after unlock
          window.removeEventListener("click", unlock);
          window.removeEventListener("mousemove", unlock);
          window.removeEventListener("keydown", unlock);
          window.removeEventListener("touchstart", unlock);
          window.removeEventListener("focus", unlock);
        })
        .catch(() => {
          // still locked, will retry on next interaction
        });
    };

    // 🔥 MULTIPLE SILENT TRIGGERS
    window.addEventListener("click", unlock);
    window.addEventListener("mousemove", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);
    window.addEventListener("focus", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("mousemove", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("focus", unlock);
    };
  }, []);

  // ==============================
  // SOCKET LISTENER
  // ==============================
  useEffect(() => {
    if (!socket) return;

    console.log("🟢 Attaching socket listener");

    const handleNewBooking = (data) => {
      console.log("🔥 NEW BOOKING RECEIVED:", data);

      setBooking(data);

      // 🔊 STOP previous
      if (alertAudioRef.current) {
        alertAudioRef.current.pause();
        alertAudioRef.current.currentTime = 0;
      }

      // 🔊 PLAY ONLY IF UNLOCKED
      if (alertAudioRef.current && audioUnlocked) {
        alertAudioRef.current
          .play()
          .then(() => {
            console.log("🔊 Sound playing");
          })
          .catch((err) => {
            console.error("🔇 Audio error:", err.message);
          });
      } else {
        console.log("🔕 Audio not unlocked yet");
      }
    };

    // 🔥 prevent duplicate listeners
    socket.off("new_booking");
    socket.on("new_booking", handleNewBooking);

    return () => {
      socket.off("new_booking", handleNewBooking);
    };
  }, [socket, audioUnlocked]);

  // ==============================
  // CLEAR BOOKING
  // ==============================
  const clearBooking = () => {
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
    }

    setBooking(null);
  };

  return (
    <BookingPopupContext.Provider value={{ booking, clearBooking }}>
      {children}
    </BookingPopupContext.Provider>
  );
}
