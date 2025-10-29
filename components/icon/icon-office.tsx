import { FC } from 'react';

interface IconOfficeProps {
    className?: string;
}

const IconOffice: FC<IconOfficeProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M7 21V7C7 5.11438 7 4.17157 7.58579 3.58579C8.17157 3 9.11438 3 11 3H13C14.8856 3 15.8284 3 16.4142 3.58579C17 4.17157 17 5.11438 17 7V21" stroke="currentColor" strokeWidth="1.5"/>
            <path opacity="0.5" d="M3 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M10 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M10 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M10 16H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
};

export default IconOffice;
