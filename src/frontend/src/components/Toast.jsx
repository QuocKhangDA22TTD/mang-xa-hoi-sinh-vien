export const Toast = ({
  message,
  type = 'success',
  onClose,
  className = '',
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 p-3 text-white rounded ${colors[type]} ${className}`}
    >
      {message}
    </div>
  );
};
