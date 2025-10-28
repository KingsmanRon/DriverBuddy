import React from 'react';

const SAFlagShield = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 120" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue outer shield border */}
      <path
        d="M50 5 L10 25 L10 70 C10 90 50 115 50 115 C50 115 90 90 90 70 L90 25 Z"
        fill="#002395"
        stroke="#001A6E"
        strokeWidth="2"
      />
      
      {/* Inner shield with flag colors */}
      <g transform="translate(0, 5)">
        {/* Red top section */}
        <path
          d="M50 15 L20 30 L20 45 L50 45 L80 45 L80 30 Z"
          fill="#E03C31"
        />
        
        {/* Blue bottom section */}
        <path
          d="M20 55 L20 70 C20 82 50 100 50 100 C50 100 80 82 80 70 L80 55 L50 55 Z"
          fill="#001489"
        />
        
        {/* Green Y-shape with yellow and white borders */}
        {/* Left black triangle */}
        <path
          d="M20 30 L20 70 L35 50 Z"
          fill="#000000"
        />
        
        {/* Yellow border around green */}
        <path
          d="M20 50 L45 50 L80 30 L80 32 L47 50 L80 68 L80 70 L45 50 L20 50 Z"
          fill="#FFB612"
        />
        
        {/* White border */}
        <path
          d="M23 50 L46 50 L78 32 L78 34 L48 50 L78 66 L78 68 L46 50 L23 50 Z"
          fill="#FFFFFF"
        />
        
        {/* Green Y-shape */}
        <path
          d="M26 50 L47 50 L76 34 L76 36 L49 50 L76 64 L76 66 L47 50 L26 50 Z"
          fill="#007A4D"
        />
      </g>
      
      {/* Shine/highlight effect */}
      <path
        d="M50 10 L25 25 L25 35 Q25 32 27 30 L50 18 L73 30 Q75 32 75 35 L75 25 Z"
        fill="url(#shieldGradient)"
        opacity="0.3"
      />
      
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SAFlagShield;
