
import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMockLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate Network Delay
    setTimeout(() => {
      setLoading(false);
      // Simple validation simulation
      if (email && !email.includes('@')) {
        setError("Please enter a valid email address.");
        return;
      }
      onLogin(); // Trigger successful login
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 animate-gradient-xy"></div>
      
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md shadow-lg rotate-3">
                <Sparkles className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">FinSight AI</h1>
            <p className="text-blue-100 font-medium text-sm">Enterprise Financial Intelligence</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Login Simulation */}
          <button
            onClick={() => handleMockLogin()}
            disabled={loading}
            className="w-full bg-white text-slate-700 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all mb-4 shadow-md"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google (Demo)
              </>
            )}
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-px bg-slate-600/50 flex-1"></div>
            <span className="text-slate-400 text-xs uppercase">Or with email</span>
            <div className="h-px bg-slate-600/50 flex-1"></div>
          </div>

          <form onSubmit={handleMockLogin} className="space-y-4">
            <div className="group">
              <label className="block text-xs font-medium text-blue-200 mb-1 ml-1 uppercase tracking-wide">Email Address</label>
              <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                <Mail className="absolute left-3 top-3 text-blue-300 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner"
                  placeholder="demo@finsight.ai" 
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-medium text-blue-200 mb-1 ml-1 uppercase tracking-wide">Password</label>
              <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.02]">
                <Lock className="absolute left-3 top-3 text-blue-300 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-300 hover:text-white font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
