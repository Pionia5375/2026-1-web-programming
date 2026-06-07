import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(email, password, name || undefined);
      nav('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error ?? '회원가입에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-600">회원가입</h1>
          <p className="text-sm text-slate-500">PlanIt에 오신 것을 환영합니다.</p>
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
          className="input"
          placeholder="이름 (선택)"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          {submitting ? '가입 중...' : '회원가입'}
        </button>
        <p className="text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">로그인</Link>
        </p>
      </form>
    </div>
  );
}
