import { useRef, useState } from "react";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";
import AudioHandler from "./AudioHandler";
import WebRTCHandler from "./WebRTCHandler";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession() {
    // Get an ephemeral key from the Fastify server
    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Audio handling is now managed by AudioHandler component

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const sdpResponse = await fetch(`${baseUrl}?intent=transcription`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    // Don't remove the audio element, just clear its source
    if (audioElement.current) {
      audioElement.current.srcObject = null;
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // WebRTC handling and audio cleanup now managed by their respective components

  return (
    <>
      {/* Non-visual components for handling WebRTC and audio */}
      <AudioHandler peerConnection={peerConnection} audioElement={audioElement} />
      <WebRTCHandler
        peerConnection={peerConnection}
        dataChannel={dataChannel}
        setDataChannel={setDataChannel}
        setIsSessionActive={setIsSessionActive}
        setEvents={setEvents}
      />

      <main className="flex flex-col h-screen">
        <div className="flex flex-1 overflow-hidden">
          <section className="flex-1 min-w-0">
            <EventLog events={events} />
          </section>
          <aside className="flex flex-col overflow-y-auto flex-1 p-4 overflow-y-auto">
            <div className="flex-grow">
              <ToolPanel
                sendClientEvent={sendClientEvent}
                events={events}
                isSessionActive={isSessionActive}
              />
            </div>
            <div className="mt-auto">
              <SessionControls
                startSession={startSession}
                stopSession={stopSession}
                sendClientEvent={sendClientEvent}
                events={events}
                isSessionActive={isSessionActive}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
