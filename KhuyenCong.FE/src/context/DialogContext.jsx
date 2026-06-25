import { createContext, useContext, useState, useCallback } from 'react';
import CustomDialog from '../components/CustomDialog/CustomDialog';

const DialogContext = createContext();

export const useDialog = () => {
  return useContext(DialogContext);
};

export const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // 'alert' | 'confirm' | 'info'
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback((title, message, type = 'alert') => {
    setDialogState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => closeDialog(),
      onCancel: null,
    });
  }, []);

  const showConfirm = useCallback((title, message, type = 'confirm') => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => {
          closeDialog();
          resolve(true);
        },
        onCancel: () => {
          closeDialog();
          resolve(false);
        },
      });
    });
  }, []);

  const showPrompt = useCallback((title, message) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        type: 'prompt',
        onConfirm: (val) => {
          closeDialog();
          resolve(val);
        },
        onCancel: () => {
          closeDialog();
          resolve(null);
        },
      });
    });
  }, []);

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      <CustomDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
      />
    </DialogContext.Provider>
  );
};
