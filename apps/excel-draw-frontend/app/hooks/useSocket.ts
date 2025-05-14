import { WS_URL } from "@/config";
import { useEffect, useState } from "react";

export default function useSocket() {
    const [socket, setSocket] = useState<WebSocket>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                };

                ws.onclose = () => {
                    console.log("WebSocket disconnected");
                    setSocket(undefined);
                    setLoading(true);
                    // Attempt to reconnect after 3 seconds
                    setTimeout(connectWebSocket, 3000);
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
    }, []);

    return {
        loading,
        socket,
        error
    };
}