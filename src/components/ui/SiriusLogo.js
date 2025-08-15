import React from 'react';

const SiriusLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Ícono de estrella con circuito */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Estrella de 5 puntas */}
          <path
            d="M12 2L14.09 8.26L22 9L16 14.14L17.18 22.02L12 18.77L6.82 22.02L8 14.14L2 9L9.91 8.26L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            className="text-blue-800"
          />
          {/* Circuito interno */}
          <circle cx="10" cy="10" r="1" fill="currentColor" className="text-blue-800" />
          <circle cx="14" cy="14" r="1" fill="currentColor" className="text-blue-800" />
          <path
            d="M10 10L14 14"
            stroke="currentColor"
            strokeWidth="1"
            className="text-blue-800"
          />
          <path
            d="M14 14L16 16"
            stroke="currentColor"
            strokeWidth="1"
            className="text-blue-800"
          />
        </svg>
      </div>

      {/* Texto del logo */}
      {showText && (
        <div className={`flex flex-col ${textSizes[size]} font-semibold text-blue-800`}>
          <span className="font-bold">SIRIUS</span>
          <span className="text-xs opacity-75">SISTEMAS DE GESTIÓN</span>
          <span className="text-xs opacity-75">INTELIGENTES</span>
        </div>
      )}
    </div>
  );
};

export default SiriusLogo;
