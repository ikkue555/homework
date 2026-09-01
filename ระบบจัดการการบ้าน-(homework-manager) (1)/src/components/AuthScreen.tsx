import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  KeyRound, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  Sparkles, 
  Sun, 
  Moon,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Send,
  Check,
  Copy,
  Inbox
} from 'lucide-react';
import { 
  registerUser, 
  loginUser, 
  requestPasswordResetOtp, 
  verifyPasswordResetOtp, 
  completePasswordResetWithOtp 
} from '../lib/firebase';
import { UserProfile, SiteSettings, ThemeMode } from '../types';

interface AuthScreenProps {
  onSuccess?: (profile: UserProfile) => void;
  onAuthSuccess?: (profile: UserProfile) => void;
  siteSettings?: SiteSettings | null;
  themeMode?: ThemeMode;
  onToggleThemeMode?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onSuccess, 
  onAuthSuccess,
  siteSettings,
  themeMode = 'light',
  onToggleThemeMode
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSuccess = (profile: UserProfile) => {
    if (onSuccess) onSuccess(profile);
    if (onAuthSuccess) onAuthSuccess(profile);
  };

  // Login form states
  const [loginUsernameOrEmail, setLoginUsernameOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember30Days, setRemember30Days] = useState(true);

  // Register form states
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regUsernameOrEmail, setRegUsernameOrEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');

  // Forgot password form states
  const [forgotStep, setForgotStep] = useState<'REQUEST_CODE' | 'ENTER_CODE' | 'SET_PASSWORD'>('REQUEST_CODE');
  const [forgotUsernameOrEmail, setForgotUsernameOrEmail] = useState('');
  const [forgotMaskedEmail, setForgotMaskedEmail] = useState('');
  const [forgotFullEmail, setForgotFullEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [simulatedOtpCode, setSimulatedOtpCode] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!loginUsernameOrEmail.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }
    if (!loginPassword) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginUser({
        emailOrUsername: loginUsernameOrEmail,
        password: loginPassword,
        remember30Days,
      });
      handleSuccess(profile);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!regDisplayName.trim()) {
      setError('กรุณากรอกชื่อแสดงผล');
      return;
    }
    if (!regUsernameOrEmail.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }
    if (regPassword.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const profile = await registerUser({
        displayName: regDisplayName,
        emailOrUsername: regUsernameOrEmail,
        password: regPassword,
        isAdmin: isAdminChecked,
        adminCode: adminCodeInput,
      });
      handleSuccess(profile);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Request Email OTP Code
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!forgotUsernameOrEmail.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้หรืออีเมลของบัญชีที่ต้องการกู้คืน');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordResetOtp(forgotUsernameOrEmail.trim());
      setForgotMaskedEmail(res.maskedEmail);
      setForgotFullEmail(res.email);
      setSimulatedOtpCode(res.code);
      setResendCooldown(60);
      setForgotStep('ENTER_CODE');
      setSuccessMessage(`ส่งรหัสยืนยัน 6 หลักไปยังอีเมล ${res.maskedEmail} เรียบร้อยแล้ว (รหัสมีอายุ ${res.expiresInMinutes} นาที)`);
    } catch (err: any) {
      console.error('Request OTP error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งรหัสยืนยัน');
    } finally {
      setLoading(false);
    }
  };

  // Re-request OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await requestPasswordResetOtp(forgotUsernameOrEmail.trim());
      setSimulatedOtpCode(res.code);
      setResendCooldown(60);
      setSuccessMessage(`ส่งรหัสยืนยันใหม่ไปยังอีเมล ${res.maskedEmail} เรียบร้อยแล้ว`);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'ไม่สามารถส่งรหัสยืนยันใหม่ได้');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP Code
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanCode = forgotOtpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError('กรุณากรอกรหัสยืนยัน 6 หลักให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordResetOtp({
        emailOrUsername: forgotUsernameOrEmail.trim(),
        code: cleanCode,
      });

      setForgotStep('SET_PASSWORD');
      setSuccessMessage('ยืนยันตัวตนสำเร็จ! กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุ');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Reset with New Password
  const handleSetNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (forgotNewPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const res = await completePasswordResetWithOtp({
        emailOrUsername: forgotUsernameOrEmail.trim(),
        code: forgotOtpCode.trim(),
        newPassword: forgotNewPassword,
      });

      setSuccessMessage(`เปลี่ยนรหัสผ่านสำหรับบัญชี "${res.username}" สำเร็จเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที`);
      // Prefill login username and new password
      setLoginUsernameOrEmail(forgotUsernameOrEmail.trim());
      setLoginPassword(forgotNewPassword);
      setMode('login');
      // Reset forgot states
      setForgotStep('REQUEST_CODE');
      setForgotOtpCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setSimulatedOtpCode(null);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    if (simulatedOtpCode) {
      navigator.clipboard?.writeText(simulatedOtpCode);
      setForgotOtpCode(simulatedOtpCode);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-sky-500 selection:text-white relative z-10 transition-colors">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 relative overflow-hidden transition-colors">
        {/* Top Decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400" />

        {/* Theme mode toggle button in top-right */}
        {onToggleThemeMode && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={onToggleThemeMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={themeMode === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-50 dark:ring-sky-950 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100 tracking-tight">
            {siteSettings?.appTitle || 'ระบบจัดการการบ้าน'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'เข้าสู่ระบบเพื่อเข้าถึงการบ้านและบันทึกข้อมูลของคุณ'
              : mode === 'register'
              ? 'สมัครสมาชิกเพื่อเริ่มต้นบันทึกและซิงค์การบ้าน'
              : 'กู้คืนและตั้งรหัสผ่านใหม่สำหรับบัญชีผู้ใช้ของคุณ'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Only when in login or register mode) */}
        {mode !== 'forgot' ? (
          <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all font-heading cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all font-heading cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 bg-sky-50/80 dark:bg-sky-950/40 rounded-2xl border border-sky-200/80 dark:border-sky-800 text-xs">
            <div className="flex items-center space-x-2 text-sky-800 dark:text-sky-200 font-bold font-heading">
              <KeyRound className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>กู้คืนรหัสผ่าน (Forgot Password)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 font-semibold flex items-center space-x-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับ</span>
            </button>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="font-medium leading-relaxed block">{successMessage}</span>
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold font-heading text-xs cursor-pointer shadow-xs transition-all flex items-center space-x-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ไปที่หน้าเข้าสู่ระบบทันที</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ชื่อผู้ใช้ หรือ อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginUsernameOrEmail}
                  onChange={(e) => setLoginUsernameOrEmail(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep('REQUEST_CODE');
                    setForgotUsernameOrEmail(loginUsernameOrEmail);
                    setForgotOtpCode('');
                    setForgotNewPassword('');
                    setForgotConfirmPassword('');
                    setSimulatedOtpCode(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline cursor-pointer transition-colors"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Checkbox: Remember Login for 30 Days */}
            <div className="pt-1">
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember30Days}
                  onChange={(e) => setRemember30Days(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                />
                <span className="font-medium">
                  จำค่าการเข้าสู่ระบบของอุปกรณ์เครื่องนี้ 30 วัน
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-heading rounded-xl shadow-md shadow-sky-600/25 text-xs tracking-wide transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD MULTI-STEP FLOW */}
        {mode === 'forgot' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Step progress pills */}
            <div className="flex items-center justify-between gap-1.5 pb-1">
              <div className={`flex-1 text-center py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                forgotStep === 'REQUEST_CODE' 
                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}>
                1. ขอรหัสทางอีเมล
              </div>
              <div className={`flex-1 text-center py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                forgotStep === 'ENTER_CODE' 
                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}>
                2. ยืนยันรหัส OTP
              </div>
              <div className={`flex-1 text-center py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                forgotStep === 'SET_PASSWORD' 
                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}>
                3. ตั้งรหัสใหม่
              </div>
            </div>

            {/* STEP 1: Request Code Form */}
            {forgotStep === 'REQUEST_CODE' && (
              <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
                <div className="p-3.5 bg-sky-50/80 dark:bg-sky-950/40 rounded-2xl border border-sky-200/80 dark:border-sky-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2.5">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-sky-950 dark:text-sky-200 block">
                      ยืนยันตัวตนผ่านอีเมลก่อนตั้งรหัสผ่านใหม่
                    </span>
                    <span>
                      กรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้ ระบบจะจัดส่งรหัสยืนยันตัวตน OTP 6 หลักไปยังอีเมลของคุณ
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ชื่อผู้ใช้ หรือ อีเมลของบัญชี <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={forgotUsernameOrEmail}
                      onChange={(e) => setForgotUsernameOrEmail(e.target.value)}
                      placeholder="กรอกชื่อผู้ใช้ หรือ อีเมลที่เคยลงทะเบียน..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-heading rounded-xl shadow-md shadow-sky-600/25 text-xs tracking-wide transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <span>กำลังส่งรหัสยืนยัน...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ส่งรหัสยืนยันไปยังอีเมล</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold font-heading rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>กลับไปหน้าเข้าสู่ระบบ</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter OTP Code Form */}
            {forgotStep === 'ENTER_CODE' && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="p-3.5 bg-sky-50/80 dark:bg-sky-950/40 rounded-2xl border border-sky-200/80 dark:border-sky-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <div className="flex items-center space-x-2 text-sky-800 dark:text-sky-200 font-bold">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>ส่งรหัสยืนยันแล้ว</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    ระบบได้ส่งรหัส OTP 6 หลักไปยังอีเมล <strong className="text-sky-700 dark:text-sky-300">{forgotMaskedEmail}</strong> แล้ว (รหัสมีอายุ 10 นาที)
                  </p>
                </div>

                {/* Interactive Simulated Inbox / Notice Banner */}
                {simulatedOtpCode && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <Inbox className="w-4 h-4 text-amber-600" />
                        <span>กล่องข้อความจำลอง (Email Inbox Simulation)</span>
                      </div>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full font-bold">
                        รหัส 6 หลัก
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-500">รหัสยืนยันของคุณคือ:</div>
                        <div className="font-mono text-base font-bold tracking-widest text-amber-700 dark:text-amber-300">
                          {simulatedOtpCode}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyOtp}
                        className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold text-[11px] rounded-lg cursor-pointer transition-colors flex items-center space-x-1"
                      >
                        {copiedOtp ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ใส่รหัสแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอก/ใส่รหัส</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    รหัสยืนยัน OTP 6 หลัก <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotOtpCode}
                      onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="กรอกตัวเลข 6 หลัก (เช่น 849201)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tracking-widest font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('REQUEST_CODE');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>เปลี่ยนอีเมล</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className={`font-semibold cursor-pointer flex items-center space-x-1 ${
                      resendCooldown > 0 
                        ? 'text-slate-400 cursor-not-allowed' 
                        : 'text-sky-600 dark:text-sky-400 hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `ส่งรหัสใหม่ (${resendCooldown}s)` : 'ส่งรหัสใหม่อีกครั้ง'}
                    </span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading || forgotOtpCode.length !== 6}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-heading rounded-xl shadow-md shadow-sky-600/25 text-xs tracking-wide transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <span>กำลังตรวจสอบรหัส...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>ยืนยันรหัส OTP และไปขั้นตอนถัดไป</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password Form */}
            {forgotStep === 'SET_PASSWORD' && (
              <form onSubmit={handleSetNewPasswordSubmit} className="space-y-4">
                <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block">
                      ยืนยันตัวตนสำเร็จแล้ว!
                    </span>
                    <span>
                      กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ (อย่างน้อย 6 ตัวอักษร)
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="ตั้งรหัสผ่านใหม่..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-heading rounded-xl shadow-md shadow-sky-600/25 text-xs tracking-wide transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>บันทึกรหัสผ่านใหม่และเข้าสู่ระบบ</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ชื่อ-นามสกุล / ชื่อผู้ใช้แสดงผล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  placeholder="เช่น ปดษวีร์ สุขใจ"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ชื่อผู้ใช้ หรือ อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regUsernameOrEmail}
                  onChange={(e) => setRegUsernameOrEmail(e.target.value)}
                  placeholder="เช่น user123 หรือ myemail@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่าน..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Checkbox: Register as Admin */}
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAdminChecked}
                  onChange={(e) => setIsAdminChecked(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
                />
                <span className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>สมัครเป็นแอดมิน (Admin)</span>
                </span>
              </label>

              {isAdminChecked && (
                <div className="mt-2.5 p-3 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl space-y-1.5 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-sky-900 dark:text-sky-300">
                      กรอกรหัสลับแอดมิน
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-500">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required={isAdminChecked}
                      value={adminCodeInput}
                      onChange={(e) => setAdminCodeInput(e.target.value)}
                      placeholder="กรอกรหัสลับแอดมิน..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold font-heading rounded-xl shadow-md shadow-sky-600/25 text-xs tracking-wide transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <span>กำลังสร้างบัญชีผู้ใช้...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ลงทะเบียนสร้างบัญชี</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p>ระบบบันทึกข้อมูลแยกตามบัญชีผู้ใช้รายบุคคล ซิงค์ตรงกันทุกอุปกรณ์</p>
        </div>
      </div>
    </div>
  );
};
