import React, { createContext, useState, useContext, useCallback, useRef, useEffect, ReactNode } from 'react';
import ToastNotification, { ToastType } from '../components/common/ToastNotification';
import ConfirmationModal from '../components/common/ConfirmationModal';

interface ConfirmationProps {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  requestConfirmation: (props: ConfirmationProps) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Confirmation Modal State
  const [confirmProps, setConfirmProps] = useState<ConfirmationProps | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // --- Toast Logic ---
  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      setToastType(null);
      toastTimeoutRef.current = null;
    }, duration);
  }, []);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // --- Confirmation Logic ---
  const requestConfirmation = useCallback((props: ConfirmationProps) => {
    setConfirmProps(props);
    setIsConfirmOpen(true);
  }, []);

  const handleConfirm = () => {
    if (confirmProps?.onConfirm) {
      confirmProps.onConfirm();
    }
    setIsConfirmOpen(false);
    setConfirmProps(null);
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
    setConfirmProps(null);
  };

  const contextValue: NotificationContextType = {
    showToast,
    requestConfirmation,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Render the actual components here, driven by state */}
      <ToastNotification message={toastMessage} type={toastType} />
      {confirmProps && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          message={confirmProps.message}
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
          confirmText={confirmProps.confirmText || 'Confirm Delete'} // Defaulting confirm text here
          cancelText={confirmProps.cancelText}
          title={confirmProps.title}
        />
      )}
    </NotificationContext.Provider>
  );
};
