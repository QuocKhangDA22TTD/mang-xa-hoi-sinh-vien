import React, { useEffect } from 'react';
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  // Xử lý khi nhấn phím Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    // Dọn dẹp event listener khi component unmount hoặc khi modal đóng
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  // Hàm xử lý click ra ngoài để đóng modal
  const handleBackdropClick = (e) => {
    // Chỉ đóng khi click vào chính lớp nền (e.target) chứ không phải các phần tử con
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity"
      onClick={handleBackdropClick} // Thêm xử lý click ra ngoài
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all ${className}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;