import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    // In a real app we'd send an email — here we skip straight to reset
    setStep('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await resetPassword(email, newPassword);
    setLoading(false);
    if (result.success) {
      setStep('done');
    } else {
      setError(result.error || 'Reset failed.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-3">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {step === 'done' ? 'All set!' : 'Reset password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'email' && 'Enter your email to reset your password'}
            {step === 'reset' && 'Choose a new password'}
            {step === 'done' && 'Your password has been updated'}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-6 card-shadow">
          {step === 'done' ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <p className="text-sm text-muted-foreground">You can now sign in with your new password.</p>
              <Link to="/login">
                <Button className="w-full">Go to Sign In</Button>
              </Link>
            </div>
          ) : step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  {error}
                </motion.p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    maxLength={255}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Continue</Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  {error}
                </motion.p>
              )}
              <div className="space-y-2">
                <Label htmlFor="newpw">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newpw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmpw">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmpw"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="pl-10"
                    maxLength={128}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
