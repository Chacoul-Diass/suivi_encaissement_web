import { FC } from 'react';

interface IconPlusProps {
    className?: string;
    strokeWidth?: number;
}

const IconPlus: FC<IconPlusProps> = ({ className, strokeWidth = 1.5 }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
};

export default IconPlus;
