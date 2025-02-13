import { ReactNode } from 'react';

interface PortalsProps {
    children?: ReactNode;
}

const Portals = ({ children }: PortalsProps) => {
    return (
        <>
            <div id="popper-portal"></div>
            <div id="modal-portal"></div>
            {children}
        </>
    );
};

export default Portals;
