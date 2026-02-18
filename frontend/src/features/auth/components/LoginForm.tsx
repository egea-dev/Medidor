import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-brand-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm p-6 md:p-8 rounded-2xl shadow-xl animate-fadeIn">
        <div className="text-center mb-6">
          <img
            src="https://egea-main-control.vercel.app/logo-placeholder.png"
            alt="EGEA Logo"
            className="h-10 w-auto mx-auto mb-3 object-contain opacity-80"
          />
          <h1 className="text-xl font-bold text-gray-900">
            Medidor Egea
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Acceso profesional
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email</label>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all text-sm"
              placeholder="demo@egea.es"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all text-sm"
                placeholder="••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            Iniciar Sesión
          </button>
        </form>



      </div>
    </div>
  );
};

export default LoginForm;
