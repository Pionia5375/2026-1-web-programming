import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      nav(loc.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error ?? '로그인에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-600">PlanIt</h1>
          <p className="text-sm text-slate-500">학사 일정과 할 일을 한 곳에서.</p>
        </div>
        <input
          type="email"
          className="input"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          className="input"
          placeholder="비밀번호 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
        <p className="text-center text-sm text-slate-500">
          처음 오셨나요?{' '}
          <Link to="/signup" className="text-brand-600 hover:underline">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
