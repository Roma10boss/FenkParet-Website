// components/ui/LoadingPage.js
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner'; // Import the actual spinner

export const LoadingPage = ({ message = 'Chargement de l\'application...', size = 'large' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-theme-primary text-theme-primary">
      <LoadingSpinner size={size} />
      {message && <p className="mt-4 text-lg font-medium">{message}</p>}
    </div>
  );
};

// You can choose to export it as a named export (as shown above)
// or a default export like this:
// export default LoadingPage;