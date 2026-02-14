import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store';

export const Toast = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] md:bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-lg animate-in fade-in slide-in-from-bottom-2 ${colors[toast.type]}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-2 min-w-[44px] min-h-[44px] -m-2 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
