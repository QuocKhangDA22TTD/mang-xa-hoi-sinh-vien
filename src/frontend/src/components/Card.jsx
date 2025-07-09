export const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded shadow-md p-4 ${className}`}>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    {children}
  </div>
);
