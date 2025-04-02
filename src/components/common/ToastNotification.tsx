import React from 'react';

export type ToastType = 'success' | 'error' | null;

interface ToastNotificationProps {
  message: string | null;
  type: ToastType;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type }) => {
  if (!message || !type) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? (
    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
  ) : (
    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  );

  // Ensure animation class is present in a global CSS file (e.g., index.css)
  // .animate-fade-in-out { animation: fadeInOut 3s ease-in-out forwards; }
  // @keyframes fadeInOut { ... }

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center z-[100] transition-opacity duration-300 animate-fade-in-out max-w-sm`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;
