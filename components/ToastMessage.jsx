'use client';

import { useLayoutEffect, useRef } from 'react';

// Toastify creates the alert and close button outside the supplied content.
// Add testing attributes only; preserve its generated IDs and behavior.
export default function ToastMessage({ testId, children }) {
  const contentRef = useRef(null);
  useLayoutEffect(() => {
    const alert = contentRef.current?.closest('.Toastify__toast, [role="status"], [role="alert"]');
    if (!alert) return;
    if (!alert.hasAttribute('data-testid')) alert.setAttribute('data-testid', testId);
    const closeButton = alert.querySelector('.Toastify__close-button');
    if (closeButton && !closeButton.hasAttribute('data-testid')) {
      closeButton.setAttribute('data-testid', `${testId}-close-btn`);
    }
  }, [testId]);
  return <div ref={contentRef} data-testid={`${testId}-message`}>{children}</div>;
}
