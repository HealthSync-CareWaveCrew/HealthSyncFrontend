import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { 
  sendRegistrationOTP,
  verifyRegistrationOTP,
  sendLoginOTP,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  clearError,
  resetOTPState
} from '../Redux/Features/authSlice';

const AuthPage = () => {
  const dispatch = useDispatch();
  const { 
    loading, 
    error: authError, 
    otpSent, 
    tempEmail,
    isAuthenticated 
  } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email', 'otp', 'success'
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpType, setOtpType] = useState('login');
  const [tempData, setTempData] = useState({}); 
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  // OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpInputsRef = useRef([]);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  // Show toast for auth errors
  useEffect(() => {
    if (authError) {
      toast.error(authError, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        },
        icon: '🔐'
      });
    }
  }, [authError]);

  // Show success message when OTP is sent
  useEffect(() => {
    if (otpSent && tempEmail) {
      toast.success(`OTP sent to ${tempEmail}`, {
        duration: 4000,
        position: 'top-right',
        icon: '📧',
        style: {
          background: '#DEF7EC',
          color: '#03543F',
          border: '1px solid #BCF0DA'
        }
      });
    }
  }, [otpSent, tempEmail]);

  // Show success message when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      toast.success('Successfully logged in! Redirecting...', {
        duration: 2000,
        position: 'top-right',
        icon: '🎉',
        style: {
          background: '#DEF7EC',
          color: '#03543F',
          border: '1px solid #BCF0DA'
        }
      });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [isAuthenticated]);

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      score: calculatePasswordScore(password),
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.password]);

  // Show OTP input when OTP is sent (for login/register)
  useEffect(() => {
    if (otpSent && tempEmail && !showForgotPassword) {
      setShowOtpInput(true);
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      // Focus first OTP input
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [otpSent, tempEmail, showForgotPassword]);

  // Handle forgot password OTP sent
  useEffect(() => {
    if (otpSent && tempEmail && showForgotPassword) {
      setForgotPasswordStep('otp');
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [otpSent, tempEmail, showForgotPassword]);

  // Timer for resend
  useEffect(() => {
    let interval;
    if ((showOtpInput || forgotPasswordStep === 'otp') && resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend, showOtpInput, forgotPasswordStep]);

  // Remove the redirect from here since we handle it with toast
  useEffect(() => {
    if (isAuthenticated) {
      // We already show toast and redirect in the above useEffect
    }
  }, [isAuthenticated]);

  const calculatePasswordScore = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const getStrengthColor = (password) => {
    if (!password) return 'bg-gray-200';
    const score = calculatePasswordScore(password);
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (password) => {
    if (!password) return 'Enter password';
    const score = calculatePasswordScore(password);
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Medium';
    return 'Strong';
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // OTP input handlers
  const handleOtpChange = (index, value) => {
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
        otpInputsRef.current[lastFilledIndex + 1]?.focus();
      }
    } else if (/^\d*$/.test(value)) {
      // Single digit
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpInputsRef.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!otp[index] && index > 0) {
        // Move to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputsRef.current[index - 1].focus();
      } else if (otp[index]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputsRef.current[index - 1].focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
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
      otpInputsRef.current[focusIndex]?.focus();
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the terms';
    }
    return newErrors;
  };

  const validateResetPasswordForm = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  // Handle Login - Send OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateLoginForm();
    
    if (Object.keys(newErrors).length === 0) {
      setOtpType('login');
      //toast.loading('Sending OTP...', { id: 'otp' });
      dispatch(sendLoginOTP({
        email: formData.email,
        password: formData.password
      }));
    } else {
      setErrors(newErrors);
      Object.values(newErrors).forEach(error => {
        toast.error(error, {
          duration: 3000,
          position: 'top-right'
        });
      });
    }
  };

  // Handle Registration - Send OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateRegisterForm();
    
    if (Object.keys(newErrors).length === 0) {
      setOtpType('registration');
      // Store the form data in state for later use
      setTempData({ 
        name: formData.name,
        email: formData.email,
        password: formData.password 
      });
      
      //toast.loading('Sending OTP...', { id: 'otp' });
      dispatch(sendRegistrationOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }));
    } else {
      setErrors(newErrors);
      Object.values(newErrors).forEach(error => {
        toast.error(error, {
          duration: 3000,
          position: 'top-right'
        });
      });
    }
  };

  // Verify OTP (for login/register)
  const handleVerifyOTP = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }
    
    toast.loading('Verifying OTP...', { id: 'verify' });
    
    if (otpType === 'login') {
      dispatch(verifyLoginOTP({
        email: tempEmail,
        otp: otpCode
      }));
    } else {
      dispatch(verifyRegistrationOTP({
        email: tempEmail,
        otp: otpCode,
        name: tempData.name,
        password: tempData.password
      }));
    }
  };

  // Resend OTP (for login/register)
  const handleResendOTP = () => {
    if (!canResend) return;
    
    toast.loading('Resending OTP...', { id: 'resend' });
    
    if (otpType === 'login') {
      dispatch(sendLoginOTP({
        email: tempEmail,
        password: formData.password
      }));
    } else {
      dispatch(sendRegistrationOTP({
        name: tempData.name,
        email: tempEmail,
        password: tempData.password
      }));
    }
    setResendTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
  };

  // Handle Forgot Password - Send OTP
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Email is required', { position: 'top-right' });
      setErrors({ forgot: 'Email is required' });
    } else if (!validateEmail(forgotEmail)) {
      toast.error('Invalid email format', { position: 'top-right' });
      setErrors({ forgot: 'Invalid email format' });
    } else {
      toast.loading('Sending OTP...', { id: 'forgot' });
      try {
        await dispatch(forgotPassword(forgotEmail)).unwrap();
        toast.success('OTP sent successfully!', { id: 'forgot' });
        setForgotPasswordStep('otp');
        setResendTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } catch (err) {
        toast.error(err || 'Failed to send OTP', { id: 'forgot' });
        setErrors({ forgot: err });
      }
    }
  };

  // Verify Forgot Password OTP and show new password form
  const handleVerifyForgotOTP = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP', {
        position: 'top-right'
      });
      return;
    }
    toast.success('OTP verified successfully!', {
      duration: 2000,
      position: 'top-right'
    });
    setForgotPasswordStep('newPassword');
  };

  // Reset Password
  const handleResetPassword = async () => {
    const newErrors = validateResetPasswordForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.values(newErrors).forEach(error => {
        toast.error(error, { position: 'top-right' });
      });
      return;
    }

    const otpCode = otp.join('');
    toast.loading('Resetting password...', { id: 'reset' });
    
    try {
      await dispatch(resetPassword({
        email: forgotEmail,
        otp: otpCode,
        newPassword: newPassword
      })).unwrap();
      
      toast.success('Password reset successfully! Redirecting to login...', {
        id: 'reset',
        duration: 3000
      });
      
      setForgotPasswordStep('success');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordStep('email');
        setForgotEmail('');
        setNewPassword('');
        setConfirmNewPassword('');
        setOtp(['', '', '', '', '', '']);
      }, 3000);
    } catch (err) {
      toast.error(err || 'Failed to reset password', { id: 'reset' });
      setErrors({ reset: err });
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'login') setShowLoginPassword(!showLoginPassword);
    if (field === 'register') setShowPassword(!showPassword);
    if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
    if (field === 'new') setShowNewPassword(!showNewPassword);
    if (field === 'confirmNew') setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const handleBackToForm = () => {
    setShowOtpInput(false);
    setOtp(['', '', '', '', '', '']);
    dispatch(resetOTPState());
  };

  const handleBackFromForgot = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOtp(['', '', '', '', '', '']);
    setErrors({});
  };

  // Render forgot password flow
  const renderForgotPassword = () => {
    switch(forgotPasswordStep) {
      case 'email':
        return (
          <div className="flex-1 flex flex-col justify-center">
            <button
              onClick={handleBackFromForgot}
              className="text-primary-1 mb-4 md:mb-6 flex items-center gap-2 hover:gap-3 transition-all text-sm md:text-base"
              disabled={loading}
            >
              <i className="fas fa-arrow-left"></i>
              Back to login
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Enter your email address and we'll send you an OTP.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={loading}
                  className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base ${
                    errors.forgot ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                  } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.forgot && (
                  <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.forgot}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-1 text-white py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary-1/90 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          </div>
        );

      case 'otp':
        return (
          <div className="flex-1 flex flex-col justify-center">
            <button
              onClick={() => setForgotPasswordStep('email')}
              className="text-primary-1 mb-6 flex items-center gap-2 hover:gap-3 transition-all"
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-3xl text-primary-1"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
              <p className="text-gray-600">
                Enter the 6-digit code sent to<br />
                <span className="font-semibold text-primary-1">{forgotEmail}</span>
              </p>
            </div>

            {/* OTP Input Grid */}
            <div className="flex justify-between gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  disabled={loading}
                  className={`w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-semibold 
                    border-2 rounded-xl focus:border-primary-1 focus:outline-none transition-all
                    ${authError || errors.otp ? 'border-red-400' : 'border-gray-200'}
                    ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                    ${digit ? 'bg-primary-1/5 border-primary-1' : ''}`}
                />
              ))}
            </div>

            {/* Resend Section */}
            <div className="flex items-center justify-between text-sm mb-6">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || loading}
                className={`text-primary-1 hover:underline transition-all flex items-center gap-1
                  ${(!canResend || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <i className="fas fa-redo-alt text-xs"></i>
                Resend Code
              </button>
              {!canResend && (
                <span className="text-gray-500">
                  Resend in <span className="font-semibold text-primary-1">{resendTimer}s</span>
                </span>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyForgotOTP}
              disabled={loading || otp.some(digit => !digit)}
              className="w-full bg-primary-1 text-white py-3 rounded-xl font-semibold hover:bg-primary-1/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>
        );

      case 'newPassword':
        return (
          <div className="flex-1 flex flex-col justify-center">
            <button
              onClick={() => setForgotPasswordStep('otp')}
              className="text-primary-1 mb-6 flex items-center gap-2 hover:gap-3 transition-all"
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Set New Password</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Enter your new password below.
            </p>

            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-colors text-sm pr-12 ${
                      errors.newPassword ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1"
                  >
                    <i className={`fas ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'} text-lg`}></i>
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor(newPassword)} transition-all duration-300`}
                          style={{ width: `${(calculatePasswordScore(newPassword) / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {getStrengthText(newPassword)}
                      </span>
                    </div>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-colors text-sm pr-12 ${
                      errors.confirmNewPassword ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmNew')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1"
                  >
                    <i className={`fas ${showConfirmNewPassword ? 'fa-eye' : 'fa-eye-slash'} text-lg`}></i>
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.confirmNewPassword}
                  </p>
                )}
              </div>

              {errors.reset && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.reset}
                </p>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading || !newPassword || !confirmNewPassword}
                className="w-full bg-primary-1 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-1/90 transition-all disabled:opacity-50 mt-4"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fas fa-check-circle text-3xl md:text-4xl text-green-500"></i>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
            <p className="text-sm md:text-base text-gray-600">
              Your password has been reset successfully.<br />
              Redirecting to login...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-primary-3 to-primary-4 flex items-center justify-center overflow-x-hidden fixed inset-0">
      {/* Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      
      {/* Add Toaster component here */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            icon: '✅',
          },
          error: {
            duration: 4000,
            icon: '❌',
          },
        }}
      />
      
      <div className="w-full bg-white flex flex-col md:flex-row overflow-hidden min-h-screen">
        
        {/* LEFT PANEL - Keep your existing left panel */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary-1 to-primary-2 p-6 md:p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-md w-full">
            <div className="mb-6 md:mb-8">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl rotate-12 mb-4 flex items-center justify-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/30 backdrop-blur-md rounded-2xl -rotate-12 flex items-center justify-center">
                  <i className={`fas ${activeTab === 'login' ? 'fa-lock' : 'fa-user-plus'} text-4xl md:text-5xl text-white`}></i>
                </div>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">
              {activeTab === 'login' ? 'Welcome Back' : 'Join Us Today'}
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
              {activeTab === 'login' 
                ? 'Sign in to continue your journey with 2FA security'
                : 'Create an account with OTP verification'}
            </p>

            <div className="space-y-3 text-left bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-brain text-xs md:text-sm"></i>
                </div>
                <span className="text-sm md:text-base">AI-based disease risk prediction</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-heartbeat text-xs md:text-sm"></i>
                </div>
                <span className="text-sm md:text-base">Early health issue detection and alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-notes-medical text-xs md:text-sm"></i>
                </div>
                <span className="text-sm md:text-base">Personalized preventive health recommendations</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
<div className="w-full md:w-1/2 p-6 md:p-8 lg:p-12 flex items-center justify-center overflow-y-auto">
  <div className="w-full max-w-md">
    {/* ALL YOUR EXISTING CONTENT GOES HERE */}
    
    {/* Remove the old error displays since we're using toasts now */}
    
    {!showForgotPassword ? (
      !showOtpInput ? (
        <>
          {/* tabs */}
          <div className="flex gap-2 mb-6 md:mb-8">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrors({});
                dispatch(clearError());
              }}
              disabled={loading}
              className={`flex-1 py-2.5 md:py-3 rounded-xl font-semibold transition-all text-sm md:text-base ${
                activeTab === 'login'
                  ? 'bg-primary-1 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrors({});
                dispatch(clearError());
              }}
              disabled={loading}
              className={`flex-1 py-2.5 md:py-3 rounded-xl font-semibold transition-all text-sm md:text-base ${
                activeTab === 'register'
                  ? 'bg-primary-1 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Register
            </button>
          </div>

          {/* forms */}
          <div className="flex-1">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 md:space-y-5">
                {/* ... keep your existing login form JSX ... */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base ${
                      errors.email ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base pr-12 ${
                        errors.password ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                      } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('login')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1 transition-colors"
                      disabled={loading}
                    >
                      <i className={`fas ${showLoginPassword ? 'fa-eye' : 'fa-eye-slash'} text-lg`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded w-4 h-4 accent-primary-1"
                      disabled={loading}
                    />
                    <span className="text-xs md:text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setForgotPasswordStep('email');
                    }}
                    className="text-xs md:text-sm text-primary-1 hover:underline"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-1 text-white py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary-1/90 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending OTP...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* keep your existing registration form JSX */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base ${
                      errors.name ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base ${
                      errors.email ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                    } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base pr-12 ${
                        errors.password ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                      } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('register')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1 transition-colors"
                      disabled={loading}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'} text-lg`}></i>
                    </button>
                  </div>
                  
                  {/* Password strength meter */}
                  {formData.password && !loading && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStrengthColor(formData.password)} transition-all duration-300`}
                            style={{ width: `${(calculatePasswordScore(formData.password) / 4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {getStrengthText(formData.password)}
                        </span>
                      </div>
                      
                      {/* Password requirements checklist */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordStrength.hasLength ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordStrength.hasNumber ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordStrength.hasUpper ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordStrength.hasLower ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-400'}`}>
                          <i className={`fas ${passwordStrength.hasSpecial ? 'fa-check-circle' : 'fa-circle'} text-xs`}></i>
                          <span>Special char</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full px-4 py-2.5 md:py-3 border-2 rounded-xl focus:outline-none transition-colors text-sm md:text-base pr-12 ${
                        errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-primary-1'
                      } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1 transition-colors"
                      disabled={loading}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'} text-lg`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs md:text-sm mt-1 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="rounded w-4 h-4 accent-primary-1"
                    disabled={loading}
                  />
                  <span className="text-xs md:text-sm text-gray-600">
                    I agree to the <a href="#" className="text-primary-1 hover:underline">Terms</a> and <a href="#" className="text-primary-1 hover:underline">Privacy Policy</a>
                  </span>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.terms}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-1 text-white py-2.5 md:py-3 rounded-xl font-semibold hover:bg-primary-1/90 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending OTP...
                    </>
                  ) : (
                    'Register with OTP'
                  )}
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        /* OTP Verification Section for Login/Register */
        <div className="flex-1 flex flex-col justify-center">
          <button
            onClick={handleBackToForm}
            className="text-primary-1 mb-6 flex items-center gap-2 hover:gap-3 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className={`fas ${otpType === 'login' ? 'fa-lock' : 'fa-user-check'} text-3xl text-primary-1`}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {otpType === 'login' ? 'Two-Factor Authentication' : 'Verify Your Email'}
            </h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to<br />
              <span className="font-semibold text-primary-1">{tempEmail}</span>
            </p>
          </div>

          {/* OTP Input Grid */}
          <div className="flex justify-between gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpInputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                disabled={loading}
                className={`w-12 h-12 md:w-14 md:h-14 text-center text-xl md:text-2xl font-semibold 
                  border-2 rounded-xl focus:border-primary-1 focus:outline-none transition-all
                  ${authError || errors.otp ? 'border-red-400' : 'border-gray-200'}
                  ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                  ${digit ? 'bg-primary-1/5 border-primary-1' : ''}`}
              />
            ))}
          </div>

          {/* Resend Section */}
          <div className="flex items-center justify-between text-sm mb-6">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={!canResend || loading}
              className={`text-primary-1 hover:underline transition-all flex items-center gap-1
                ${(!canResend || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <i className="fas fa-redo-alt text-xs"></i>
              Resend Code
            </button>
            {!canResend && (
              <span className="text-gray-500">
                Resend in <span className="font-semibold text-primary-1">{resendTimer}s</span>
              </span>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.some(digit => !digit)}
            className="w-full bg-primary-1 text-white py-3 rounded-xl font-semibold hover:bg-primary-1/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            <i className="fas fa-shield-alt text-primary-1 mr-1"></i>
            {otpType === 'login' ? 'This helps keep your account secure' : "We'll never ask for your password"}
          </p>
        </div>
      )
    ) : (
      /* Forgot Password Flow */
      renderForgotPassword()
    )}

    {/* footer note - hide when in OTP or forgot password flows */}
    {!showOtpInput && !showForgotPassword && (
      <p className="text-center text-gray-500 text-xs md:text-sm mt-4 md:mt-6 border-t border-gray-100 pt-4">
        <i className="fas fa-shield-alt text-primary-1 mr-1"></i>
        End-to-end encrypted · 100% secure
      </p>
    )}
  </div>
</div>
      </div>

      {/* animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-bounce { animation: bounce 1s ease-in-out; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;