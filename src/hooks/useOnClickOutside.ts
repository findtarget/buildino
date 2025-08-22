// src/hooks/useOnClickOutside.ts

import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current;
      const target = event.target as HTMLElement;

      // چک کردن اگر کلیک داخل تقویم شمسی است
      if (target?.closest('.rdp') || target?.closest('.jalali-calendar')) {
        return;
      }

      if (!el || el.contains(target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.removeEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
