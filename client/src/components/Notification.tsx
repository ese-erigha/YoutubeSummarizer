import { useState, useEffect } from "react";

interface NotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

const Notification = ({
  message,
  isVisible,
  onClose,
  type = "success",
}: NotificationProps) => {
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (isVisible) {
      setAnimationClass("notification-enter");
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setAnimationClass("notification-exit");
        // Give time for exit animation to complete
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && animationClass !== "notification-exit") return null;

  const bgColor = 
    type === "success" 
      ? "bg-primary" 
      : type === "error" 
        ? "bg-destructive" 
        : "bg-primary";

  const icon = 
    type === "success" 
      ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ) 
      : type === "error" 
        ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
        ) 
        : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="16" y2="12"/>
            <line x1="12" x2="12.01" y1="8" y2="8"/>
          </svg>
        );

  return (
    <div 
      className={`fixed bottom-4 right-4 ${bgColor} text-primary-foreground px-4 py-3 rounded-md shadow-lg flex items-center z-50 ${animationClass}`}
      role="alert"
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default Notification;
