import { useEffect } from "react";

/**
 * Lightweight, non-blocking toast notifications.
 * Replaces window.alert() so errors/success messages don't freeze the UI.
 *
 * Usage:
 *   const [toasts, setToasts] = useState([]);
 *   const showToast = (message, type = "info") => {
 *     const id = Date.now() + Math.random();
 *     setToasts((prev) => [...prev, { id, message, type }]);
 *   };
 *   <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter(t => t.id !== id))} isDark={isDark} />
 */

const TYPE_STYLES = {
  success: {
    light: "bg-emerald-50 border-emerald-200 text-emerald-800",
    dark: "bg-emerald-900/40 border-emerald-700 text-emerald-300",
    dot: "bg-emerald-500",
  },
  error: {
    light: "bg-rose-50 border-rose-200 text-rose-800",
    dark: "bg-rose-900/40 border-rose-700 text-rose-300",
    dot: "bg-rose-500",
  },
  warning: {
    light: "bg-amber-50 border-amber-200 text-amber-800",
    dark: "bg-amber-900/40 border-amber-700 text-amber-300",
    dot: "bg-amber-500",
  },
  info: {
    light: "bg-blue-50 border-blue-200 text-blue-800",
    dark: "bg-blue-900/40 border-blue-700 text-blue-300",
    dot: "bg-blue-500",
  },
};

const ToastItem = ({ toast, onDismiss, isDark }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const style = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full sm:w-auto sm:min-w-[320px] max-w-md flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 fade-in duration-300 ${
        isDark ? style.dark : style.light
      }`}
    >
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
      <p className="flex-1 text-sm font-semibold leading-snug break-words">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="opacity-50 hover:opacity-100 transition-opacity font-bold text-sm leading-none px-1"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastStack = ({ toasts, onDismiss, isDark }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed z-[200] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex flex-col-reverse sm:flex-col gap-2 items-stretch sm:items-end pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} isDark={isDark} />
      ))}
    </div>
  );
};

export default ToastStack;
