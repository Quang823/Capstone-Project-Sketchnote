import { Client } from "@stomp/stompjs";
import AsyncStorage from "@react-native-async-storage/async-storage";

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.onConnectedCallback = null;
    }

    /**
     * Connect to WebSocket server using Native WebSocket (bypass SockJS)
     * @param {string} url - Base URL (e.g. https://sketchnote.litecsys.com/ws)
     * @param {function} onConnected - Callback when connected
     * @param {function} onError - Callback on error
     */
    async connect(url, onConnected, onError) {
        if (this.client && this.client.active) {
            console.log("⚠️ Already connected/connecting to WebSocket");
            if (this.connected && onConnected) onConnected();
            return;
        }

        // Chuyển đổi URL sang WS protocol
        // Server cấu hình Native WebSocket tại /ws (không dùng SockJS), nên không cần thêm /websocket
        const wsUrl = url.replace(/^http/, "ws").replace(/\/$/, "");
        console.log(`🔌 Connecting to Native WebSocket at: ${wsUrl}`);
        console.log("🛠️ TextEncoder check:", !!global.TextEncoder);

        const token = await AsyncStorage.getItem("accessToken");
        console.log("🔑 Token found:", !!token);

        this.client = new Client({
            brokerURL: wsUrl, // Dùng brokerURL cho Native WebSocket
            
            // Tắt webSocketFactory để StompJS tự dùng Native WebSocket
            // Hoặc force dùng WebSocket global nếu cần
            webSocketFactory: () => {
                 return new WebSocket(wsUrl);
            },

            connectHeaders: token ? {
                Authorization: `Bearer ${token}`
            } : {},

            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            
            // Quan trọng cho React Native + StompJS v7
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,

            debug: (str) => {
                console.log('🔍 [STOMP Debug]', str);
            },

            onConnect: (frame) => {
                console.log("✅ STOMP Connected!");
                this.connected = true;
                if (onConnected) onConnected();
                
                this.subscriptions.forEach((sub, destination) => {
                    this._doSubscribe(destination, sub.callback);
                });
            },

            onStompError: (frame) => {
                console.error('❌ Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                if (onError) onError(frame);
            },

            onWebSocketError: (event) => {
                console.error("❌ WebSocket Error Event:", event);
            },

            onWebSocketClose: (e) => {
                console.log("🔴 WebSocket closed");
                this.connected = false;
            }
        });

        this.client.activate();
    }

    /**
     * Subscribe to a topic
     * @param {string} destination - Topic path
     * @param {function} callback - Message handler
     */
    subscribe(destination, callback) {
        // Lưu lại thông tin subscription để dùng khi reconnect
        this.subscriptions.set(destination, { callback });

        if (this.connected) {
            this._doSubscribe(destination, callback);
        } else {
            console.log(`⏳ Queued subscription for: ${destination}`);
        }
    }

    _doSubscribe(destination, callback) {
        if (!this.client || !this.connected) return;

        console.log(`📥 Subscribing to: ${destination}`);
        this.client.subscribe(destination, (message) => {
            if (message.body) {
                try {
                    const msg = JSON.parse(message.body);
                    callback(msg);
                } catch (e) {
                    console.error("❌ Error parsing message:", e);
                }
            }
        });
    }

    /**
     * Send a message
     * @param {string} destination - Destination path
     * @param {object} body - Message body (object)
     */
    send(destination, body) {
        if (!this.client || !this.connected) {
            console.warn("⚠️ Cannot send: WebSocket not connected");
            return;
        }

        console.log(`🚀 Sending to ${destination}:`, body);
        this.client.publish({
            destination: destination,
            body: JSON.stringify(body),
            headers: { "content-type": "application/json" }
        });
    }

    /**
     * Disconnect
     */
    disconnect() {
        if (this.client) {
            console.log("🛑 Disconnecting WebSocket...");
            this.client.deactivate();
            this.client = null;
            this.connected = false;
            this.subscriptions.clear();
        }
    }
}

export const webSocketService = new WebSocketService();