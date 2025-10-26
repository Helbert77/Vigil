import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <img 
        src="/splash-logo.png" 
        alt="Vigil Splash Screen" 
        className="w-full h-full object-cover" 
      />
    </div>
  );
};

export default SplashScreen;