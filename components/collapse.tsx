import React, { useState } from 'react';
import AnimateHeight from 'react-animate-height';

interface CollapseProps {
  children: React.ReactNode;
  isOpen?: boolean;
  className?: string;
}

const Collapse: React.FC<CollapseProps> = ({ children, isOpen = false, className = '' }) => {
  const [height, setHeight] = useState<'auto' | number>(isOpen ? 'auto' : 0);

  return (
    <AnimateHeight
      duration={300}
      height={height}
      className={className}
    >
      {children}
    </AnimateHeight>
  );
};

export default Collapse;
