import { createContext, useState } from "react";
import Toast from "react-native-toast-message";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({});

  return (
    <ToastContext.Provider value={{ toastConfig, setToastConfig }}>
      {children}
      <Toast config={toastConfig} />
    </ToastContext.Provider>
  );
};
