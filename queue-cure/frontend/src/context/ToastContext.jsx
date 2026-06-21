import { useCallback, useState } from "react";
import { ToastContext } from "../hooks/useToast";

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = "info", duration = 3500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const variantClasses = {
    info: "bg-clinic-teal text-white",
    success: "bg-clinic-teal text-white",
    error: "bg-clinic-coralDark text-white",
    warning: "bg-clinic-amber text-clinic-ink",
  };

  return (
    <div
      role="status"
      className={`animate-slide-up rounded-xl px-4 py-3 shadow-lg text-sm font-medium flex items-start gap-3 ${
        variantClasses[toast.variant] || variantClasses.info
      }`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="opacity-70 hover:opacity-100 transition-opacity leading-none text-base"
      >
        ×
      </button>
    </div>
  );
}
