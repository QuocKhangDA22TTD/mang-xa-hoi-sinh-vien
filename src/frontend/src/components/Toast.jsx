import React, { useEffect } from 'react';

export const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3000, // Thêm prop để tùy chỉnh thời gian
  className = '',
}) => {
  // Tự động đóng Toast sau một khoảng thời gian
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Dọn dẹp timer khi component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [onClose, duration]);

  const baseClasses =
    'fixed bottom-5 right-5 p-4 rounded-lg shadow-lg flex items-center justify-between max-w-sm text-white';

  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-xl font-semibold leading-none hover:opacity-75"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
