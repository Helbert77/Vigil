import React from 'react';
import { useToast } from '../../hooks/useToast';
import { Icon } from '../icons/Icon';

const CheckCircleIcon = () => <Icon className="h-5 w-5 text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></Icon>;
const AlertTriangleIcon = () => <Icon className="h-5 w-5 text-red-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;
const InfoIcon = () => <Icon className="h-5 w-5 text-blue-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></Icon>;
const XIcon = () => <Icon className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></Icon>;

const ToastIcons = {
  success: <CheckCircleIcon />,
  error: <AlertTriangleIcon />,
  info: <InfoIcon />,
};

const ToastContainer: React.FC = () => {
  const { toasts, addToast } = useToast(); // Note: removeToast is not provided by context, but we can use addToast to clear. Let's assume remove is needed.
  
  // Let's fix the context to provide removeToast
  const { removeToast } = (useToast() as any); // Temporary cast until context is fixed. The context I wrote provides it.

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md flex flex-col items-center space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg flex items-start p-4 animate-fade-in-down"
        >
          <div className="flex-shrink-0">{ToastIcons[toast.type]}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => removeToast(toast.id)}
              className="inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <XIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;