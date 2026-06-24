import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SettingsProvider } from "./context/SettingsContext.tsx";
import { ToastProvider } from "./components/Toast.tsx";

// Request notification permission (auto-granted in Electron)
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SettingsProvider>
  </React.StrictMode>,
);

window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
