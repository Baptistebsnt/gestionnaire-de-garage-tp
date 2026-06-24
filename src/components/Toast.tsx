import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CheckCircle, X } from "lucide-react";

type ToastItem = { id: string; message: string };

type ToastCtx = { toast: (message: string) => void };

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const sendSystemNotification = (message: string) => {
  try {
    window.ipcRenderer?.send("show-notification", {
      title: "Garage Manager",
      body: message,
    });
  } catch {
    // not in electron
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    sendSystemNotification(message);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3200,
    );
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "var(--surface-3)",
              border: "1px solid var(--border-2)",
              borderRadius: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
              minWidth: 240,
              maxWidth: 340,
              animation: "toastIn 0.2s ease",
              pointerEvents: "all",
            }}
          >
            <CheckCircle size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                padding: 0,
                display: "flex",
                flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
