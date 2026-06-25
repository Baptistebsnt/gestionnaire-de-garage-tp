import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { CheckCircle, X } from "lucide-react";

type ToastItem = { id: string; message: string };
type ToastCtx  = { toast: (message: string) => void };

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const sendSystemNotification = (message: string) => {
  try {
    window.ipcRenderer?.send("show-notification", {
      title: "Garage Manager",
      body: message,
    });
  } catch {
    // not in Electron
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

      {/* Toast stack */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-enter pointer-events-auto flex min-w-60 max-w-[340px] items-center gap-2.5 rounded-lg border border-border-2 bg-surface-3 px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          >
            <CheckCircle size={15} className="shrink-0 text-success" />
            <span className="flex-1 text-[13px] text-fg">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="btn-icon shrink-0 text-fg-3 hover:text-fg"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
