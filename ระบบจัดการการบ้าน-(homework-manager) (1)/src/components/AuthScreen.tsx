import React, { useState } from 'react';
import { BookOpen, KeyRound, UserCheck, ShieldCheck, Lock, Mail, User, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';
import { registerUser, loginUser, ADMIN_SECRET_CODE } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
        remember30Days: remember30Days,
      });
      onAuthSuccess(profile);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regDisplayName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล หรือชื่อแสดงผล');
      return;
    }
    if (!regUsernameOrEmail.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (isAdminChecked) {
      const cleanCode = adminCodeInput.trim();
      if (!cleanCode) {
        setError('กรุณากรอกรหัสลับสำหรับสมัครแอดมิน');
        return;
      }
      if (cleanCode !== ADMIN_SECRET_CODE) {
        setError('รหัสลับแอดมินไม่ถูกต้อง');
        return;
      }
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
      onAuthSuccess(profile);
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-blue-50 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-sky-500 selection:text-white">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-sky-100 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Top Decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400" />

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-50 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-800 tracking-tight">
            ระบบจัดการการบ้าน
          </h1>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'เข้าสู่ระบบเพื่อเข้าถึงการบ้านและบันทึกข้อมูลของคุณ'
              : 'สมัครสมาชิกเพื่อเริ่มต้นบันทึกและซิงค์การบ้าน'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all font-heading cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all font-heading cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-sky-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                ชื่อผู้ใช้ หรือ อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginUsernameOrEmail}
                  onChange={(e) => setLoginUsernameOrEmail(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ หรือ อีเมล..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Checkbox: Remember Login for 30 Days */}
            <div className="pt-1">
              <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember30Days}
                  onChange={(e) => setRemember30Days(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="font-medium text-slate-700">
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

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                ชื่อ-นามสกุล / ชื่อผู้ใช้แสดงผล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  placeholder="เช่น ปดษวีร์ สุขใจ"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                ชื่อผู้ใช้ หรือ อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regUsernameOrEmail}
                  onChange={(e) => setRegUsernameOrEmail(e.target.value)}
                  placeholder="เช่น user123 หรือ myemail@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่าน..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Checkbox: Register as Admin */}
            <div className="pt-1.5 border-t border-slate-100">
              <label className="flex items-center space-x-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAdminChecked}
                  onChange={(e) => setIsAdminChecked(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                />
                <span className="flex items-center space-x-1.5 text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>สมัครเป็นแอดมิน (Admin)</span>
                </span>
              </label>

              {isAdminChecked && (
                <div className="mt-2.5 p-3 bg-sky-50/80 border border-sky-200 rounded-2xl space-y-1.5 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-sky-900">
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
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-sky-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono"
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
        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <p>ระบบบันทึกข้อมูลแยกตามบัญชีผู้ใช้รายบุคคล ซิงค์ตรงกันทุกอุปกรณ์</p>
        </div>
      </div>
    </div>
  );
};
