import { useEffect, useState } from 'react';
import FunctionCallOutput from './FunctionCallOutput';
import { NotebookPen } from 'lucide-react';
import systemPrompt from '../data/systemPrompt';

const ToolPanel = ({ isSessionActive, sendClientEvent, events }) => {
    const [functionAdded,
        setFunctionAdded] = useState(false);
    const [functionCallOutputs,
        setFunctionCallOutputs] = useState([]);

    // Process events to detect function calls and session events
    useEffect(() => {
        if (!events
            ?.length)
            return;

        // Handle initial session setup
        if (!functionAdded) {
            const sessionCreatedEvent = events.find(e => e.type === "session.created");
            if (sessionCreatedEvent) {
                console.log("Session created, adding function tools");
                sendClientEvent({
                    type: "session.update",
                    session: {
                        turn_detection: {
                            type: "semantic_vad",
                            eagerness: "high",
                            create_response: true,
                            interrupt_response: true
                        },
                        input_audio_transcription: {
                            model: "gpt-4o-transcribe"
                        },
                        temperature: 1,
                        modalities: [
                            "text"
                        ],
                        instructions: systemPrompt,
                        tools: [
                            {
                                type: "function",
                                name: "add_to_notebook",
                                description: "Gebruik deze functie om vervolgvragen te noteren die de Hypotheekadviseur zou moeten stellen.",
                                parameters: {
                                    type: "object",
                                    strict: true,
                                    properties: {
                                        fact: {
                                            type: "string",
                                            description: "Een feit of notitie die relevant is voor het gesprek. Bijvoorbeeld: Axel heeft een studieschuld."
                                        },
                                        question: {
                                            type: "string",
                                            description: "De vervolgvraag die gesteld moet worden. Bijvoorbeeld: Zijn er lopende leningen?"
                                        }
                                    },
                                    required: ["fact", "question"]
                                }
                            }
                        ],
                        tool_choice: "auto"
                    }
                });
                setFunctionAdded(true);
            }
        }

        // Process new events to look for function calls
        const newEvents = [...events];
        for (const event of newEvents) {
            // Check for direct function call outputs
            if (event.type === "response.done" && event.response.output) {
                event
                    .response
                    .output
                    .forEach((output) => {
                        if (output.type === "function_call" && 
                            (output.name === "add_to_notebook")) {
                            console.log("TOOL CALL:", output);
                            const isDuplicate = functionCallOutputs.some(existingOutput => existingOutput.call_id === output.call_id);

                            if (!isDuplicate) {
                                setFunctionCallOutputs(prev => [
                                    ...prev,
                                    output
                                ]);
                            }
                        }
                    });
            }
        }
    }, [events, functionAdded, sendClientEvent, functionCallOutputs]);

    // Reset state when session is no longer active
    useEffect(() => {
        if (!isSessionActive) {
            setFunctionAdded(false);
            setFunctionCallOutputs([]);
        }
    }, [isSessionActive]);

    return (
        <section className="flex flex-col">
            <div className="space-y-4">
                {functionCallOutputs.length > 0 ? (
                    functionCallOutputs.map((output, index) => (
                        <FunctionCallOutput
                            key={`${output.call_id}-${index}`}
                            functionCallOutput={output} />
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                        <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
                            <NotebookPen className="h-10 w-10 mb-2 text-gray-400" />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ToolPanel;