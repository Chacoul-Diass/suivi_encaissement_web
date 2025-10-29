import { FC } from 'react';

interface IconFilterProps {
    className?: string;
}

const IconFilter: FC<IconFilterProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path opacity="0.5" d="M14.5 13.0001L4.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M19.5 13.0001L16.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M14.5 13C14.5 14.3807 15.6193 15.5 17 15.5C18.3807 15.5 19.5 14.3807 19.5 13C19.5 11.6193 18.3807 10.5 17 10.5C15.6193 10.5 14.5 11.6193 14.5 13Z" stroke="currentColor" strokeWidth="1.5"/>
            <path opacity="0.5" d="M9.5 7.00012L4.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M19.5 7.00012L11.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9.5 7C9.5 8.38071 10.6193 9.5 12 9.5C13.3807 9.5 14.5 8.38071 14.5 7C14.5 5.61929 13.3807 4.5 12 4.5C10.6193 4.5 9.5 5.61929 9.5 7Z" stroke="currentColor" strokeWidth="1.5"/>
            <path opacity="0.5" d="M9.5 19.0001L4.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M19.5 19.0001L11.5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9.5 19C9.5 20.3807 10.6193 21.5 12 21.5C13.3807 21.5 14.5 20.3807 14.5 19C14.5 17.6193 13.3807 16.5 12 16.5C10.6193 16.5 9.5 17.6193 9.5 19Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    );
};

export default IconFilter;
