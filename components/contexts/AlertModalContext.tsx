import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AlertModal from '../layouts/alertModal';

interface AlertModalContextType {
    openAlertModal: (data: {
        alerts: any[];
        loading: boolean;
        pagination: any;
        onPageChange: (page: number) => void;
        activeTabId?: number;
        onTabChange?: (tabId: number) => void;
        onShowConfirmModal?: (title: string, message: string, onConfirm: () => void) => void;
    }) => void;
    closeAlertModal: () => void;
    updateModalData: (data: Partial<{
        alerts: any[];
        loading: boolean;
        pagination: any;
    }>) => void;
}

const AlertModalContext = createContext<AlertModalContextType | undefined>(undefined);

export const useAlertModal = () => {
    const context = useContext(AlertModalContext);
    if (!context) {
        throw new Error('useAlertModal must be used within an AlertModalProvider');
    }
    return context;
};

interface AlertModalProviderProps {
    children: ReactNode;
}

export const AlertModalProvider = ({ children }: AlertModalProviderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);

    const openAlertModal = useCallback((data: any) => {
        setModalData(data);
        setIsOpen(true);
    }, []);

    const closeAlertModal = useCallback(() => {
        setIsOpen(false);
        setModalData(null);
    }, []);

    const updateModalData = useCallback((newData: Partial<{
        alerts: any[];
        loading: boolean;
        pagination: any;
    }>) => {
        setModalData((prev: any) => ({
            ...prev,
            ...newData
        }));
    }, []);

    return (
        <AlertModalContext.Provider value={{ openAlertModal, closeAlertModal, updateModalData }}>
            {children}
            {typeof window !== 'undefined' && createPortal(
                <AlertModal
                    isOpen={isOpen}
                    onClose={closeAlertModal}
                    alerts={modalData?.alerts || []}
                    loading={modalData?.loading || false}
                    pagination={modalData?.pagination}
                    onPageChange={modalData?.onPageChange || (() => { })}
                    activeTabId={modalData?.activeTabId}
                    onTabChange={modalData?.onTabChange}
                    onShowConfirmModal={modalData?.onShowConfirmModal}
                />,
                document.getElementById('modal-portal') || document.body
            )}
        </AlertModalContext.Provider>
    );
}; 