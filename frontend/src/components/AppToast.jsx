import {
    CheckCircle,
    AlertCircle,
    Info,
    XCircle,
  } from 'lucide-react';
  
  const toastStyles = {
    success: {
      icon: CheckCircle,
      iconWrap: 'bg-emerald-100 text-emerald-600',
      accent: 'bg-emerald-500',
    },
    error: {
      icon: XCircle,
      iconWrap: 'bg-rose-100 text-rose-600',
      accent: 'bg-rose-500',
    },
    warning: {
      icon: AlertCircle,
      iconWrap: 'bg-amber-100 text-amber-600',
      accent: 'bg-amber-500',
    },
    info: {
      icon: Info,
      iconWrap: 'bg-indigo-100 text-indigo-600',
      accent: 'bg-indigo-500',
    },
  };
  
  const AppToast = ({ type = 'info', title, message }) => {
    const styles = toastStyles[type] || toastStyles.info;
    const Icon = styles.icon;
  
    return (
      <div className="relative overflow-hidden rounded-[20px] bg-white">
        <div className={`absolute inset-y-0 left-0 w-1.5 ${styles.accent}`} />
  
        <div className="flex gap-3 p-4 pl-5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </div>
  
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950">{title}</p>
  
            {message && (
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default AppToast;
  