import React from 'react';
import { AnimeLogo } from './AnimeLogo';

interface ThakurgaonLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const ThakurgaonLogo: React.FC<ThakurgaonLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  return <AnimeLogo className={className} size={size} />;
};

