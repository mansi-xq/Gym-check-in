import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface CheckInButtonProps {
  isCheckedIn: boolean;
  onCheckIn: () => void;
  disabled?: boolean;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  isCheckedIn,
  onCheckIn,
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isCheckedIn) return;
    
    setIsAnimating(true);
    onCheckIn();
    
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isCheckedIn}
      className={`
        relative w-32 h-32 rounded-full border-4 transition-all duration-300 transform
        ${isCheckedIn 
          ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105' 
          : 'bg-white border-blue-500 text-blue-500 hover:bg-blue-50 hover:scale-105 active:scale-95'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isAnimating ? 'animate-pulse' : ''}
        shadow-xl
      `}
    >
      <div className="flex flex-col items-center justify-center h-full">
        {isCheckedIn ? (
          <>
            <CheckCircle2 size={48} className="mb-2" />
            <span className="text-sm font-semibold">Checked In!</span>
          </>
        ) : (
          <>
            <Circle size={48} className="mb-2" />
            <span className="text-sm font-semibold">Check In</span>
          </>
        )}
      </div>
      
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
      )}
    </button>
  );
};