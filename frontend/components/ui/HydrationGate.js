
import { useState, useEffect } from 'react';

const HydrationGate = ({ children, fallback = null }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback; // Render fallback during SSR and initial hydration
  }

  return <>{children}</>; // Render actual content only on client
};

export default HydrationGate;