import React, { useState, useEffect, useRef } from 'react';

const OtpVerification = ({ 
  isOpen, 
  onClose, 
  email, 
  onVerify, 
  onResend, 
  loading, 
  error,
  type = 'verification' // 'verification', 'registration', or 'login'
}) => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Timer for resend
  useEffect(() => {
    let interval;
    if (isOpen && timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend, isOpen]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(''));
      setTimer(30);
      setCanResend(false);
      // Focus first input after modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle pasted value
      const pastedValue = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d*$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      // Focus on appropriate input
      const lastFilledIndex = Math.min(index + pastedValue.length - 1, 5);
      if (lastFilledIndex < 5 && newOtp[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      }

      // Check if complete
      if (newOtp.every((digit) => digit !== '')) {
        onVerify(newOtp.join(''));
      }
    } else if (/^\d*$/.test(value)) {
      // Single digit
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }

      // Check if complete
      if (newOtp.every((digit) => digit !== '')) {
        onVerify(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!otp[index] && index > 0) {
        // Move to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else if (otp[index]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1].focus();
    }

    // Handle delete
    if (e.key === 'Delete' && index < 5) {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = '';
      newOtp[index + 1] = '';
      setOtp(newOtp);
      inputRefs.current[index].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const pastedArray = pastedData.split('');
      const newOtp = [...otp];
      pastedArray.forEach((char, index) => {
        if (index < 6) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);

      // Focus on last input
      const focusIndex = Math.min(pastedArray.length, 5);
      inputRefs.current[focusIndex]?.focus();

      // Check if complete
      if (pastedArray.length === 6) {
        onVerify(pastedData);
      }
    }
  };

  const handleResendClick = () => {
    if (canResend && !loading) {
      setOtp(Array(6).fill(''));
      setTimer(30);
      setCanResend(false);
      onResend();
      inputRefs.current[0]?.focus();
    }
  };

  // Get title based on type
  const getTitle = () => {
    switch(type) {
      case 'registration':
        return 'Verify Your Email';
      case 'login':
        return 'Two-Factor Authentication';
      default:
        return 'Enter Verification Code';
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch(type) {
      case 'registration':
        return 'fa-user-check';
      case 'login':
        return 'fa-shield-alt';
      default:
        return 'fa-lock';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className={`fas ${getIcon()} text-2xl text-primary-1`}></i>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            {getTitle()}
          </h2>
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-semibold text-primary-1 break-all mt-1">
            {email}
          </p>
        </div>

        {/* OTP Input Grid */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6} // Allow paste of multiple digits
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              className={`w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-semibold 
                border-2 rounded-xl focus:border-primary-1 focus:outline-none transition-all
                ${error ? 'border-red-400' : 'border-gray-200'}
                ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                ${digit ? 'bg-primary-1/5 border-primary-1' : ''}`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm bg-red-100 text-red-700 border border-red-200">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Resend Section */}
        <div className="flex items-center justify-between text-sm mb-6">
          <button
            type="button"
            onClick={handleResendClick}
            disabled={!canResend || loading}
            className={`text-primary-1 hover:underline transition-all flex items-center gap-1
              ${(!canResend || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <i className="fas fa-redo-alt text-xs"></i>
            Resend Code
          </button>
          {!canResend && (
            <span className="text-gray-500">
              Resend in <span className="font-semibold text-primary-1">{timer}s</span>
            </span>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onVerify(otp.join(''))}
            disabled={loading || otp.some(digit => !digit)}
            className="flex-1 bg-primary-1 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-1/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </div>

        {/* Additional Info for Login */}
        {type === 'login' && (
          <p className="text-xs text-center text-gray-500 mt-4">
            <i className="fas fa-shield-alt text-primary-1 mr-1"></i>
            This helps keep your account secure
          </p>
        )}
      </div>
    </div>
  );
};

export default OtpVerification;