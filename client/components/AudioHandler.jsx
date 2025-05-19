import { useEffect, useRef } from "react";

export default function AudioHandler({ peerConnection, audioElement }) {
  // Set up to play remote audio from the model
  useEffect(() => {
    if (!audioElement.current) {
      audioElement.current = document.createElement("audio");
      document.body.appendChild(audioElement.current); // Ensure audio element is in the DOM
    }
    audioElement.current.autoplay = true;
    
    if (peerConnection.current) {
      peerConnection.current.ontrack = (e) => {
        console.log("Track received:", e.streams[0]);
        audioElement.current.srcObject = e.streams[0];
        audioElement.current.play().catch(e => console.error("Audio playback failed:", e));
      };
    }
    
    // Clean up audio element on component unmount
    return () => {
      if (audioElement.current && audioElement.current.parentNode) {
        audioElement.current.parentNode.removeChild(audioElement.current);
      }
    };
  }, [peerConnection, audioElement]);

  return null; // This is a non-visual component
}
