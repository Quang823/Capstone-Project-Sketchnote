import { Client } from "@stomp/stompjs";
import { TextEncoder, TextDecoder } from "text-encoding";

// Polyfill for TextEncoder/TextDecoder if needed in RN
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

class NotificationWebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.onMessageCallback = null;
        this.userId = null;
    }

    /**
     * Connect to notification WebSocket
     * @param {string} url - WebSocket URL
     * @param {number} userId - User ID
     * @param {string} token - Auth token
     * @param {function} onMessage - Callback when receiving notification
     * @param {function} onError - Callback on error
     */
    connect(url, userId, token, onMessage, onError) {
        // Always update the callback reference
        this.onMessageCallback = onMessage;

        if (this.client && this.client.active) {
            console.log("🔌 WebSocket already connected, updated callback");
            return;
        }

        this.userId = userId;

        this.client = new Client({
            brokerURL: url,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            // React Native specific: Use native WebSocket
            webSocketFactory: () => {
                return new WebSocket(url);
            },

            // Important for React Native + StompJS v7
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,

            onConnect: (frame) => {
                this.connected = true;
                console.log("✅ WebSocket connected successfully");

                // Subscribe to user-specific notification queue
                // Based on user's previous request: /queue/notifications/{userId}
                const destination = `/queue/notifications/${this.userId}`;
                console.log("📡 Subscribing to:", destination);

                this.client.subscribe(destination, (message) => {
                    console.log("📨 Raw message received:", message.body);
                    if (message.body) {
                        try {
                            const notification = JSON.parse(message.body);
                            console.log("📬 Parsed notification:", notification);
                            if (this.onMessageCallback) {
                                console.log("🔔 Calling onMessageCallback...");
                                this.onMessageCallback(notification);
                            } else {
                                console.warn("⚠️ No onMessageCallback set!");
                            }
                        } catch (e) {
                            console.warn("Failed to parse notification:", e);
                        }
                    }
                });
            },

            onStompError: (frame) => {
                console.warn('❌ Broker reported error: ' + frame.headers['message']);
                console.warn('Additional details: ' + frame.body);
                if (onError) onError(frame);
            },

            onWebSocketClose: () => {
                this.connected = false;
            },

            onWebSocketError: (event) => {
                if (onError) onError(event);
            }
        });

        this.client.activate();
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
            this.connected = false;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    }
}

// Export singleton instance
export const notificationWebSocketService = new NotificationWebSocketService();
