import React from 'react';

interface AbstractInfographicProps {
  className?: string;
}

export const AbstractInfographic: React.FC<AbstractInfographicProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 400 300" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* Clean white background */}
        <linearGradient id="white-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#F5F5F5" />
        </linearGradient>
        
        {/* Light navy for subtle elements */}
        <linearGradient id="navy-subtle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4E2F0" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#C8D8E8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B8C7D9" stopOpacity="0.7" />
        </linearGradient>
        
        {/* Navy for accents */}
        <linearGradient id="navy-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A3B7D1" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8BA3C4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7A91B3" stopOpacity="0.8" />
        </linearGradient>
        
        {/* Light warm accent */}
        <linearGradient id="warm-subtle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8DCC0" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#D4C4A8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#C8B890" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Clean white background */}
      <rect width="400" height="300" fill="#FFFFFF" />


      {/* Minimal geometric shapes */}
      <g opacity="0.6">
        {/* Large subtle circle */}
        <circle cx="200" cy="150" r="80" fill="url(#navy-subtle)" />
        
        {/* Medium circle */}
        <circle cx="200" cy="150" r="50" fill="none" stroke="url(#navy-accent)" strokeWidth="1.2" />
        
        {/* Small inner circle */}
        <circle cx="200" cy="150" r="20" fill="none" stroke="url(#warm-subtle)" strokeWidth="0.8" />
      </g>

      {/* Subtle circuit-inspired lines */}
      <g opacity="0.5">
        {/* Top horizontal line */}
        <line x1="80" y1="80" x2="320" y2="80" stroke="url(#navy-subtle)" strokeWidth="0.8" />
        
        {/* Bottom horizontal line */}
        <line x1="80" y1="220" x2="320" y2="220" stroke="url(#navy-subtle)" strokeWidth="0.8" />
        
        {/* Left vertical line */}
        <line x1="80" y1="80" x2="80" y2="220" stroke="url(#navy-subtle)" strokeWidth="0.8" />
        
        {/* Right vertical line */}
        <line x1="320" y1="80" x2="320" y2="220" stroke="url(#navy-subtle)" strokeWidth="0.8" />
      </g>

      {/* Corner accent elements */}
      <g opacity="0.7">
        {/* Top-left corner */}
        <circle cx="80" cy="80" r="3" fill="url(#navy-accent)" />
        <line x1="60" y1="80" x2="70" y2="80" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        <line x1="80" y1="60" x2="80" y2="70" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        
        {/* Top-right corner */}
        <circle cx="320" cy="80" r="3" fill="url(#navy-accent)" />
        <line x1="330" y1="80" x2="340" y2="80" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        <line x1="320" y1="60" x2="320" y2="70" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        
        {/* Bottom-left corner */}
        <circle cx="80" cy="220" r="3" fill="url(#navy-accent)" />
        <line x1="60" y1="220" x2="70" y2="220" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        <line x1="80" y1="230" x2="80" y2="240" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        
        {/* Bottom-right corner */}
        <circle cx="320" cy="220" r="3" fill="url(#navy-accent)" />
        <line x1="330" y1="220" x2="340" y2="220" stroke="url(#warm-subtle)" strokeWidth="0.6" />
        <line x1="320" y1="230" x2="320" y2="240" stroke="url(#warm-subtle)" strokeWidth="0.6" />
      </g>

      {/* Minimal floating elements */}
      <g opacity="0.6">
        <circle cx="150" cy="120" r="2" fill="url(#navy-subtle)" />
        <circle cx="250" cy="180" r="2" fill="url(#navy-subtle)" />
        <circle cx="180" cy="200" r="1.5" fill="url(#warm-subtle)" />
        <circle cx="220" cy="100" r="1.5" fill="url(#warm-subtle)" />
      </g>

      {/* Subtle connecting lines */}
      <g opacity="0.4">
        <line x1="150" y1="120" x2="200" y2="150" stroke="url(#navy-subtle)" strokeWidth="0.5" />
        <line x1="250" y1="180" x2="200" y2="150" stroke="url(#navy-subtle)" strokeWidth="0.5" />
        <line x1="180" y1="200" x2="200" y2="150" stroke="url(#navy-subtle)" strokeWidth="0.5" />
        <line x1="220" y1="100" x2="200" y2="150" stroke="url(#navy-subtle)" strokeWidth="0.5" />
      </g>
    </svg>
  );
}; 