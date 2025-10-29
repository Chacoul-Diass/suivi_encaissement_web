import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

const IconChevronDown = ({ className = '', ...props }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`inline ${className}`}
            {...props}
        >
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );
};

export default IconChevronDown;
