import { WS_URL } from "@/config";
import { useEffect, useState, useRef } from "react";

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const lastConnectionAttempt = useRef<number>(0);
    const connectionTimeout = useRef<NodeJS.Timeout>();
    const MAX_RETRIES = 5;
    const MIN_RECONNECT_DELAY = 2000; 

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
        }

        const connectWebSocket = () => {
            const now = Date.now();
            const timeSinceLastAttempt = now - lastConnectionAttempt.current;

            // If we've tried to connect too recently, wait
            if (timeSinceLastAttempt < MIN_RECONNECT_DELAY) {
                const delay = MIN_RECONNECT_DELAY - timeSinceLastAttempt;
                console.log(`Waiting ${delay}ms before attempting reconnection...`);
                connectionTimeout.current = setTimeout(connectWebSocket, delay);
                return;
            }

            lastConnectionAttempt.current = now;

            try {
                const ws = new WebSocket(`${WS_URL}?token=${token}`);

                ws.onopen = () => {
                    console.log("WebSocket connected");
                    setLoading(false);
                    setError(null);
                    setSocket(ws);
                    setRetryCount(0); 
                };

                ws.onclose = (event) => {
                    console.log("WebSocket disconnected", event.code, event.reason);
                    setSocket(undefined);
                    setLoading(true);

                    // Only attempt to reconnect if we haven't exceeded max retries
                    if (retryCount < MAX_RETRIES) {
                        const backoffDelay = Math.min(3000 * Math.pow(2, retryCount), 30000); // Max 30 second delay
                        console.log(`Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES}) in ${backoffDelay}ms...`);
                        setRetryCount(prev => prev + 1);
                        connectionTimeout.current = setTimeout(connectWebSocket, backoffDelay);
                    } else {
                        setError("Failed to connect after multiple attempts");
                        setLoading(false);
                    }
                };

                ws.onerror = (event) => {
                    console.error("WebSocket error:", event);
                    // Don't set error here as onclose will handle reconnection
                };

                return ws;
            } catch (err) {
                console.error("Error creating WebSocket:", err);
                setError("Failed to create WebSocket connection");
                setLoading(false);
                return null;
            }
        };

        const ws = connectWebSocket();

        return () => {
            if (connectionTimeout.current) {
                clearTimeout(connectionTimeout.current);
            }
            if (ws) {
                ws.close();
            }
        };
    }, [retryCount]);

    return {
        loading,
        socket,
        error
    };
}