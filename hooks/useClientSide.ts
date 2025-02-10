import { useEffect, useState } from 'react';

export const useClientSide = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export const isClientSide = () => {
  return typeof window !== 'undefined';
};

export const safeDOM = {
  querySelector: (selector: string): Element | null => {
    if (!isClientSide()) return null;
    return document.querySelector(selector);
  },
  querySelectorAll: (selector: string): NodeListOf<Element> | [] => {
    if (!isClientSide()) return [];
    return document.querySelectorAll(selector);
  },
  getElementById: (id: string): HTMLElement | null => {
    if (!isClientSide()) return null;
    return document.getElementById(id);
  },
  createElement: (tagName: string): HTMLElement | null => {
    if (!isClientSide()) return null;
    return document.createElement(tagName);
  },
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
    if (!isClientSide()) return;
    window.addEventListener(type, listener, options);
  },
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
    if (!isClientSide()) return;
    window.removeEventListener(type, listener, options);
  }
};
