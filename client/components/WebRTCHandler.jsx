import { useEffect } from "react";

export default function WebRTCHandler({
  peerConnection,
  dataChannel,
  setDataChannel,
  setIsSessionActive,
  setEvents
}) {
  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
      });
    }
  }, [dataChannel, setEvents, setIsSessionActive]);

  return null; // This is a non-visual component
}
