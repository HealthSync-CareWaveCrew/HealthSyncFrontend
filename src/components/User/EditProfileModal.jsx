import { useState, useEffect } from 'react';
import { updateProfile, changePassword, sendEmailChangeOTP, verifyEmailChangeOTP } from '../../Redux/Api/api';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function EditProfileModal({ isOpen, onClose, user, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpInputsRef] = useState([]);
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    email: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  // Track changes
  const [hasChanges, setHasChanges] = useState({
    name: false,
    email: false,
    password: false
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
      });
      setOriginalData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    setHasChanges({
      name: profileData.name !== originalData.name,
      email: profileData.email !== originalData.email,
      password: passwordData.newPassword.length > 0 || passwordData.currentPassword.length > 0
    });
  }, [profileData, passwordData, originalData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowOtpInput(false);
      setOtp(['', '', '', '', '', '']);
      setExpandedSection(null);
      setPendingEmail('');
    }
  }, [isOpen]);

  // Password strength checker
  useEffect(() => {
    const password = passwordData.newPassword;
    setPasswordStrength({
      score: calculatePasswordScore(password),
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [passwordData.newPassword]);

  // Timer for resend
  useEffect(() => {
    let interval;
    if (showOtpInput && resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend, showOtpInput]);

  // Focus first OTP input when shown
  useEffect(() => {
    if (showOtpInput) {
      setTimeout(() => {
        otpInputsRef[0]?.focus();
      }, 100);
    }
  }, [showOtpInput]);

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

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pastedValue = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d*$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);

      const lastFilledIndex = Math.min(index + pastedValue.length - 1, 5);
      if (lastFilledIndex < 5 && newOtp[lastFilledIndex]) {
        otpInputsRef[lastFilledIndex + 1]?.focus();
      }
    } else if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        otpInputsRef[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpInputsRef[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputsRef[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputsRef[index + 1]?.focus();
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

      const focusIndex = Math.min(pastedArray.length, 5);
      otpInputsRef[focusIndex]?.focus();
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    onClose();
    navigate('/forgot-password');
  };

  // Handle name change only
  const handleNameChange = async () => {
    setLoading(true);
    
    try {
      const response = await updateProfile({ name: profileData.name });
      
      toast.success('Name updated successfully!', {
        duration: 2000,
        position: 'top-right',
        icon: '✅'
      });
      
      const updatedUser = response.data?.data?.user || response.data?.user;
      onUpdate(updatedUser);
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update name', {
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Validate password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }

    if (!passwordData.currentPassword) {
      toast.error('Current password is required', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }

    setLoading(true);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!', {
        duration: 2000,
        position: 'top-right',
        icon: '✅'
      });
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setExpandedSection(null);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password', {
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Send OTP for email change
  const handleSendEmailOTP = async () => {
    if (profileData.email === originalData.email) {
      toast.error('Email is unchanged', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }

    setLoading(true);
    
    try {
      await sendEmailChangeOTP({ newEmail: profileData.email });
      
      setPendingEmail(profileData.email);
      setShowOtpInput(true);
      setResendTimer(30);
      setCanResend(false);
      
      toast.success(`OTP sent to ${profileData.email}`, {
        duration: 4000,
        position: 'top-right',
        icon: '📧'
      });
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP', {
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and update email
  const handleVerifyEmailOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP', {
        duration: 3000,
        position: 'top-right'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await verifyEmailChangeOTP({
        newEmail: pendingEmail,
        otp: otpCode
      });
      
      toast.success('Email updated successfully!', {
        duration: 2000,
        position: 'top-right',
        icon: '✅'
      });
      
      const updatedUser = response.data?.data?.user || response.data?.user;
      onUpdate(updatedUser);
      setOriginalData({ ...originalData, email: pendingEmail });
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed', {
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      await sendEmailChangeOTP({ newEmail: pendingEmail });
      
      setResendTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      toast.success('OTP resent successfully!', {
        duration: 3000,
        position: 'top-right'
      });
    } catch (error) {
      toast.error('Failed to resend OTP', {
        duration: 3000,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromOTP = () => {
    setShowOtpInput(false);
    setOtp(['', '', '', '', '', '']);
    setPendingEmail('');
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Font Awesome CDN
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(link);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">
                {showOtpInput ? 'Verify Email Change' : 'Edit Profile'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showOtpInput ? (
              /* Profile Edit Form */
              <div className="p-6 space-y-4">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  {/* Name Field with Save Button */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-colors"
                        placeholder="Enter your full name"
                      />
                      {hasChanges.name && (
                        <button
                          onClick={handleNameChange}
                          disabled={loading}
                          className="px-4 py-2 bg-primary-1 text-white text-sm font-medium rounded-lg hover:bg-primary-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Update Name
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Field with Update Button */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-colors"
                        placeholder="Enter your email"
                      />
                      {hasChanges.email && (
                        <button
                          onClick={handleSendEmailOTP}
                          disabled={loading}
                          className="px-4 py-2 bg-primary-1 text-white text-sm font-medium rounded-lg hover:bg-primary-2 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Update Email
                        </button>
                      )}
                    </div>
                    {hasChanges.email && (
                      <p className="mt-1 text-xs text-amber-600">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Email change requires OTP verification
                      </p>
                    )}
                  </div>
                </div>

                {/* Change Password Section - Expandable */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('password')}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium text-gray-700">Change Password</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        expandedSection === 'password' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {expandedSection === 'password' && (
                    <div className="p-4 space-y-4 border-t border-gray-200">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-colors pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1"
                          >
                            <i className={`fas ${showCurrentPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          </button>
                        </div>
                      </div>

                      {/* Forgot Password Link */}
                      {/* <div className="flex justify-end">
                        <button
                          onClick={handleForgotPassword}
                          className="text-sm text-primary-1 hover:underline focus:outline-none"
                        >
                          Forgot password?
                        </button>
                      </div> */}

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-colors pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1"
                          >
                            <i className={`fas ${showNewPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          </button>
                        </div>
                        
                        {/* Password strength meter */}
                        {passwordData.newPassword && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getStrengthColor(passwordData.newPassword)} transition-all duration-300`}
                                  style={{ width: `${(calculatePasswordScore(passwordData.newPassword) / 4) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {getStrengthText(passwordData.newPassword)}
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
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-1/20 focus:border-primary-1 transition-colors pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-1"
                          >
                            <i className={`fas ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          </button>
                        </div>
                      </div>

                      {/* Update Password Button */}
                      {passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword && (
                        <button
                          onClick={handlePasswordChange}
                          disabled={loading}
                          className="w-full py-2.5 bg-primary-1 text-white font-medium rounded-lg hover:bg-primary-2 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* OTP Verification Form */
              <div className="p-6">
                <button
                  onClick={handleBackFromOTP}
                  className="text-primary-1 mb-4 flex items-center gap-2 hover:gap-3 transition-all"
                >
                  <i className="fas fa-arrow-left"></i>
                  Back
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-envelope text-2xl text-primary-1"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Verify New Email</h3>
                  <p className="text-sm text-gray-600">
                    Enter the 6-digit code sent to<br />
                    <span className="font-semibold text-primary-1">{pendingEmail}</span>
                  </p>
                </div>

                {/* OTP Input Grid */}
                <div className="flex justify-between gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputsRef[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      disabled={loading}
                      className={`w-11 h-11 text-center text-lg font-semibold 
                        border-2 rounded-lg focus:border-primary-1 focus:outline-none transition-all
                        ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                        ${digit ? 'bg-primary-1/5 border-primary-1' : 'border-gray-200'}`}
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
                  onClick={handleVerifyEmailOTP}
                  disabled={loading || otp.some(digit => !digit)}
                  className="w-full bg-primary-1 text-white py-3 rounded-lg font-semibold hover:bg-primary-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Update Email'
                  )}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500 text-center">
                <i className="fas fa-shield-alt text-primary-1 mr-1"></i>
                Your information is securely encrypted and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditProfileModal;