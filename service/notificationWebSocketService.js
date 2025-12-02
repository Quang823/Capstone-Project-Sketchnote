class NotificationWebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.subscriptionId = null;
        this.messageCallback = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    /**
     * Connect to notification WebSocket
     * @param {string} url - WebSocket URL (e.g., "wss://sketchnote.litecsys.com/ws-notifications")
     * @param {number} userId - User ID to subscribe to notifications
     * @param {function} onMessage - Callback when receiving notification
     * @param {function} onError - Callback on error
     */
    connect(url, userId, onMessage, onError) {
        if (this.connected) {
            console.log("Already connected to Notification WebSocket");
            return;
        }

        try {
            this.messageCallback = onMessage;
            console.log(`🔌 Creating WebSocket connection to: ${url}`);
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log("✅ Notification WebSocket connected");
                console.log("📊 WebSocket readyState:", this.socket.readyState);
                this.connected = true;
                this.reconnectAttempts = 0;

                // Send CONNECT frame
                this.sendFrame("CONNECT", {
                    "accept-version": "1.2",
                    "heart-beat": "10000,10000"
                });
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(event.data, userId);
            };

            this.socket.onerror = (error) => {
                console.error("❌ Notification WebSocket error:", error);
                console.error("📊 WebSocket readyState:", this.socket?.readyState);
                if (onError) onError(error);
            };

            this.socket.onclose = (event) => {
                console.log("🔴 Notification WebSocket disconnected");
                console.log("📊 Close code:", event.code);
                console.log("📊 Close reason:", event.reason);
                console.log("📊 Was clean:", event.wasClean);
                this.connected = false;
                this.handleReconnect(url, userId, onMessage, onError);
            };
        } catch (error) {
            console.error("Failed to create Notification WebSocket:", error);
            if (onError) onError(error);
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(data, userId) {
        const lines = data.split("\n");
        const command = lines[0];

        if (command === "CONNECTED") {
            console.log("✅ STOMP connected for notifications");
            // Subscribe to user-specific notification topic
            const destination = `/topic/notifications.${userId}`;
            this.subscribe(destination);
        } else if (command === "MESSAGE") {
            // Parse MESSAGE frame
            let body = null;
            let inBody = false;

            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === "") {
                    inBody = true;
                    continue;
                }

                if (inBody) {
                    body = lines.slice(i).join("\n").replace(/\0$/, "");
                    break;
                }
            }

            if (body) {
                try {
                    const notification = JSON.parse(body);
                    console.log("📨 Received notification:", notification);
                    if (this.messageCallback) {
                        this.messageCallback(notification);
                    }
                } catch (e) {
                    console.error("Failed to parse notification:", e);
                }
            }
        }
    }

    /**
     * Send STOMP frame
     */
    sendFrame(command, headers = {}, body = "") {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected");
            return;
        }

        let frame = command + "\n";

        for (const [key, value] of Object.entries(headers)) {
            frame += `${key}:${value}\n`;
        }

        frame += "\n" + body + "\0";

        this.socket.send(frame);
    }

    /**
     * Subscribe to notification topic
     */
    subscribe(destination) {
        if (!this.connected) {
            console.error("Cannot subscribe: WebSocket not connected");
            return;
        }

        this.subscriptionId = `sub-${Date.now()}-${Math.random()}`;

        this.sendFrame("SUBSCRIBE", {
            id: this.subscriptionId,
            destination: destination
        });

        console.log(`📥 Subscribed to ${destination}`);
    }

    /**
     * Unsubscribe from notification topic
     */
    unsubscribe() {
        if (!this.subscriptionId) return;

        this.sendFrame("UNSUBSCRIBE", {
            id: this.subscriptionId
        });

        console.log(`🔴 Unsubscribed: ${this.subscriptionId}`);
        this.subscriptionId = null;
    }

    /**
     * Handle reconnection
     */
    handleReconnect(url, userId, onMessage, onError) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
                `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
            );

            setTimeout(() => {
                this.connect(url, userId, onMessage, onError);
            }, this.reconnectDelay);
        } else {
            console.error("❌ Max reconnection attempts reached");
        }
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.unsubscribe();
            this.sendFrame("DISCONNECT", {});
            this.socket.close();
            this.socket = null;
            this.connected = false;
            console.log("🔴 Disconnected from Notification WebSocket");
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
