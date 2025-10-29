import { FC } from 'react';

interface IconBuildingProps {
    className?: string;
}

const IconBuilding: FC<IconBuildingProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M19 9.77806V16.2C19 17.8802 19 18.7202 18.673 19.362C18.3854 19.9265 17.9265 20.3854 17.362 20.673C16.7202 21 15.8802 21 14.2 21H9.8C8.11984 21 7.27976 21 6.63803 20.673C6.07354 20.3854 5.6146 19.9265 5.32698 19.362C5 18.7202 5 17.8802 5 16.2V9.77806M3 10L12 3L21 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path opacity="0.5" d="M10 21V17C10 16.4477 10.4477 16 11 16H13C13.5523 16 14 16.4477 14 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path opacity="0.5" d="M9 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M9 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
};

export default IconBuilding;
