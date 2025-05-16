import { WS_URL } from "@/config";
import { useEffect, useState } from "react";

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 5;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No authentication token found");
            setLoading(false);
            return;
        }

        const connectWebSocket = () => {
            try {
                const ws = new WebSocket(`${WS_URL}?token=${token}`);

                ws.onopen = () => {
                    console.log("WebSocket connected");
                    setLoading(false);
                    setError(null);
                    setSocket(ws);
                    setRetryCount(0); // Reset retry count on successful connection
                };

                ws.onclose = (event) => {
                    console.log("WebSocket disconnected", event.code, event.reason);
                    setSocket(undefined);
                    setLoading(true);

                    // Only attempt to reconnect if we haven't exceeded max retries
                    if (retryCount < MAX_RETRIES) {
                        console.log(`Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
                        setRetryCount(prev => prev + 1);
                        setTimeout(connectWebSocket, 3000 * (retryCount + 1)); // Exponential backoff
                    } else {
                        setError("Failed to connect after multiple attempts");
                        setLoading(false);
                    }
                };

                ws.onerror = (event) => {
                    console.error("WebSocket error:", event);
                    setError("Failed to connect to WebSocket server");
                    setLoading(false);
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