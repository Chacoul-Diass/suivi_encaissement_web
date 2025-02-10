import { FC } from 'react';

interface IconBankProps {
    className?: string;
}

const IconBank: FC<IconBankProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 6L12 3L19 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path opacity="0.5" d="M4 10V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M20 10V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M8 10V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M16 10V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M12 10V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
};

export default IconBank;
