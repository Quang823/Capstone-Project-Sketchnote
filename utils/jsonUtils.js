import React, { useRef, useEffect } from "react";
import { WebView } from "react-native-webview";
import { View } from "react-native";

// A very simple event emitter
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    const callbacks = this.listeners[event];
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
  removeListener(event, callback) {
    const callbacks = this.listeners[event];
    if (callbacks) {
      this.listeners[event] = callbacks.filter((cb) => cb !== callback);
    }
  }
}
const eventEmitter = new EventEmitter();

const parserHtml = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body>
  <script>
    const post = (payload) => window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    document.addEventListener('message', (event) => {
      try {
        const { jobId, jsonString } = JSON.parse(event.data);
        const data = JSON.parse(jsonString);
        post({ success: true, jobId, data });
      } catch (error) {
        const { jobId } = JSON.parse(event.data);
        post({ success: false, jobId, error: error.message });
      }
    });
  </script>
</body>
</html>
`;

let jobCounter = 0;
const PARSE_TIMEOUT = 30000; // 30 seconds timeout for large JSON
const pendingJobs = new Map(); // Track pending jobs for cleanup

// This is the component that will be placed in App.js
export function BackgroundJsonParser() {
  const webViewRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const handleParseRequest = ({ jobId, jsonString }) => {
      if (isMounted.current && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ jobId, jsonString }));
      }
    };

    eventEmitter.on("parse-json", handleParseRequest);
    
    return () => {
      isMounted.current = false;
      eventEmitter.removeListener("parse-json", handleParseRequest);
      
      // ✅ Cancel all pending jobs when unmounting
      pendingJobs.forEach((timeoutId, jobId) => {
        clearTimeout(timeoutId);
        eventEmitter.emit(`parse-complete-${jobId}`, {
          success: false,
          jobId,
          error: 'WebView unmounted'
        });
      });
      pendingJobs.clear();
    };
  }, []);

  const handleMessage = (event) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      
      // ✅ Clear timeout for completed job
      if (pendingJobs.has(payload.jobId)) {
        clearTimeout(pendingJobs.get(payload.jobId));
        pendingJobs.delete(payload.jobId);
      }
      
      eventEmitter.emit(`parse-complete-${payload.jobId}`, payload);
    } catch (err) {
      console.warn('[BackgroundJsonParser] Failed to parse message:', err);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("WebView error: ", nativeEvent);
    // Reject any pending jobs
    eventEmitter.emit("webview-crashed", nativeEvent.description);
  };

  return (
    <View style={{ width: 0, height: 0, position: "absolute" }}>
      <WebView
        ref={webViewRef}
        source={{ html: parserHtml }}
        onMessage={handleMessage}
        onError={handleError}
      />
    </View>
  );
}

export const parseJsonInBackground = (jsonString) => {
  const jobId = jobCounter++;
  
  return new Promise((resolve, reject) => {
    let timeoutId = null;
    
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        pendingJobs.delete(jobId);
      }
      eventEmitter.removeListener(`parse-complete-${jobId}`, handleComplete);
      eventEmitter.removeListener("webview-crashed", handleCrash);
    };
    
    const handleComplete = (payload) => {
      cleanup();
      
      if (payload.success) {
        resolve(payload.data);
      } else {
        reject(new Error(`Background JSON parse failed: ${payload.error}`));
      }
    };

    const handleCrash = (errorDescription) => {
      cleanup();
      reject(
        new Error(`WebView crashed during JSON parsing: ${errorDescription}`)
      );
    };
    
    const handleTimeout = () => {
      cleanup();
      reject(
        new Error(`JSON parsing timed out after ${PARSE_TIMEOUT}ms. Data may be too large.`)
      );
    };

    eventEmitter.on(`parse-complete-${jobId}`, handleComplete);
    eventEmitter.on("webview-crashed", handleCrash);
    
    // ✅ Set timeout to prevent hanging
    timeoutId = setTimeout(handleTimeout, PARSE_TIMEOUT);
    pendingJobs.set(jobId, timeoutId);

    eventEmitter.emit("parse-json", { jobId, jsonString });
  });
};
