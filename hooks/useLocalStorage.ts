import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
    // Initialize state with a function to avoid accessing localStorage during SSR
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === 'undefined') {
                return initialValue;
            }

            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    // Update localStorage when state changes
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.log(error);
        }
    }, [key, storedValue]);

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
};

// Utility function to check if code is running on client side
export const isClient = typeof window !== 'undefined';

// Utility function to access localStorage safely
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        if (isClient) {
            return localStorage.getItem(key);
        }
        return null;
    },
    setItem: (key: string, value: string): void => {
        if (isClient) {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key: string): void => {
        if (isClient) {
            localStorage.removeItem(key);
        }
    },
    clear: (): void => {
        if (isClient) {
            localStorage.clear();
        }
    }
};
