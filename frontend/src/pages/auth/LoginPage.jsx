import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, Shield, Users, Briefcase, User, Copy, Check } from 'lucide-react';
import { loginUser } from '@/store/slices/authSlice';
import { selectAuth } from '@/store/slices/authSlice';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

const ROLES = [
  { id: 'admin',          label: 'Admin',          icon: Shield,   color: 'text-primary-400',  bg: 'bg-primary-500/10 border-primary-500/30' },
  { id: 'senior_manager', label: 'Senior Manager',  icon: Briefcase,color: 'text-warning-400',  bg: 'bg-warning-500/10 border-warning-500/30' },
  { id: 'hr_recruiter',   label: 'HR Recruiter',   icon: Users,    color: 'text-accent-400',   bg: 'bg-accent-500/10 border-accent-500/30'   },
  { id: 'employee',       label: 'Employee',        icon: User,     color: 'text-slate-400',    bg: 'bg-white/5 border-white/10'              },
];

const DEMO_USERS = [
  { role: 'admin',          label: 'Admin',          icon: Shield,   email: 'admin@demo.com',    password: 'Admin@1234',   color: 'text-primary-400',  border: 'border-primary-500/40', bg: 'bg-primary-500/10',  hoverBg: 'hover:bg-primary-500/15' },
  { role: 'senior_manager', label: 'Senior Manager', icon: Briefcase,email: 'manager@demo.com',  password: 'Manager@1234', color: 'text-warning-400',  border: 'border-warning-500/40', bg: 'bg-warning-500/10',  hoverBg: 'hover:bg-warning-500/15' },
  { role: 'hr_recruiter',   label: 'HR Recruiter',   icon: Users,    email: 'hr@demo.com',       password: 'HR@12345',     color: 'text-accent-400',   border: 'border-accent-500/40',  bg: 'bg-accent-500/10',   hoverBg: 'hover:bg-accent-500/15'  },
  { role: 'employee',       label: 'Employee',        icon: User,     email: 'employee@demo.com', password: 'Employee@1234',color: 'text-slate-300',   border: 'border-white/20',       bg: 'bg-white/5',         hoverBg: 'hover:bg-white/10'       },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(selectAuth);
  const [selectedRole, setSelectedRole] = useState('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => {
    dispatch(loginUser({ ...data, role: selectedRole }));
  };

  const fillDemo = (demo) => {
    setSelectedRole(demo.role);
    setValue('email', demo.email, { shouldValidate: true });
    setValue('password', demo.password, { shouldValidate: true });
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="min-h-screen bg-surface-950 bg-mesh flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface-900/60 border-r border-white/5 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">SmartHR Nexus</span>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest mb-4">
              AI-Powered HRMS
            </p>
            <h1 className="font-display text-4xl font-bold text-white leading-tight mb-6">
              The Future of<br />
              <span className="text-gradient">Workforce Intelligence</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Manage 5,000+ employees with AI-driven insights, automated payroll,
              intelligent recruitment screening, and real-time analytics.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: 'AI Resume Screening', value: '< 2s' },
              { label: 'Employee Uptime',      value: '99.9%' },
              { label: 'Payroll Accuracy',     value: '100%' },
              { label: 'Max Employees',        value: '5,000+' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <p className="text-2xl font-display font-bold text-primary-400">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-slate-600">© 2024 SmartHR Nexus. All rights reserved.</p>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">SmartHR Nexus</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to your workspace</p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="input-label mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                      ${selectedRole === role.id
                        ? `${role.bg} ${role.color}`
                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/5'
                      }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@company.com"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <a href="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Sign In to Nexus
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-600 text-center mt-6">
            Protected by AES-256 encryption · SOC 2 Type II Compliant
          </p>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-950 px-3 text-xs text-slate-500 font-medium uppercase tracking-widest">
                  Demo Credentials
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 mt-3 mb-3">
              Click any card to auto-fill &amp; sign in instantly
            </p>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => fillDemo(demo)}
                    className={`group text-left p-3 rounded-xl border ${demo.border} ${demo.bg} ${demo.hoverBg} transition-all duration-200 cursor-pointer`}
                  >
                    <div className={`flex items-center gap-1.5 mb-1.5 ${demo.color} font-semibold text-xs`}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{demo.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-slate-400 text-[10px] font-mono truncate">{demo.email}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyText(demo.email, `${demo.role}-email`); }}
                          className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                        >
                          {copiedField === `${demo.role}-email` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-slate-500 text-[10px] font-mono">{demo.password}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyText(demo.password, `${demo.role}-pass`); }}
                          className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0"
                        >
                          {copiedField === `${demo.role}-pass` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
