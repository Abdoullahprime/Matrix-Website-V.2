import React, { useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2, LogOut, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import usePageMeta from '../../hooks/usePageMeta';
import { adminApi, AdminPostRow, AdminSolutionRow, Session, setCsrf } from './adminApi';
import PostEditor from './PostEditor';
import { formatDate } from '../../lib/blog';

const field =
  'w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-matrix-blue-primary focus:ring-4 focus:ring-matrix-blue-primary/10 outline-none font-medium bg-white';

function Shell({ children, user, onLogout }: { children: React.ReactNode; user?: string; onLogout?: () => void }) {
  const { pathname } = useLocation();
  const inSolutions = pathname.startsWith('/admin/solutions');
  const tab = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${active ? 'bg-white text-matrix-navy' : 'text-white/80 hover:text-white hover:bg-white/10'}`;
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-matrix-navy text-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="font-extrabold tracking-tight">
              Matrix Admin
            </Link>
            {user && (
              <nav className="flex items-center gap-2" aria-label="Admin menu">
                <Link to="/admin" className={tab(!inSolutions)}>Blog</Link>
                <Link to="/admin/solutions" className={tab(inSolutions)}>Solutions</Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-5 text-sm font-bold">
            <Link to="/blog" className="flex items-center gap-1 text-white/80 hover:text-white" target="_blank">
              View blog <ExternalLink size={14} />
            </Link>
            {user && (
              <>
                <span className="text-white/60 hidden sm:inline">{user}</span>
                <button type="button" onClick={onLogout} className="flex items-center gap-1 hover:text-white/80">
                  <LogOut size={16} /> Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

function AuthForm({ needsSetup, onDone }: { needsSetup: boolean; onDone: (s: Session) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = needsSetup ? await adminApi.setup(setupKey, username, password) : await adminApi.login(username, password);
      setCsrf(r.csrf);
      onDone({ admin: r.admin, csrf: r.csrf, needsSetup: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl shadow-matrix-navy/5 p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-matrix-navy">{needsSetup ? 'Create the first admin' : 'Admin sign in'}</h1>
        {needsSetup && (
          <p className="mt-2 text-sm text-slate-600 font-medium">
            One-time setup. You need the ADMIN_SETUP_KEY that was added to matrix.env on the server.
          </p>
        )}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {needsSetup && (
          <input
            className={field}
            type="password"
            placeholder="Setup key"
            value={setupKey}
            onChange={(e) => setSetupKey(e.target.value)}
            autoComplete="off"
            required
          />
        )}
        <input
          className={field}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          className={field}
          type="password"
          placeholder={needsSetup ? 'Password (10+ characters)' : 'Password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={needsSetup ? 'new-password' : 'current-password'}
          required
        />
        {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2">
          {busy && <Loader2 size={18} className="animate-spin" />}
          {needsSetup ? 'Create admin and sign in' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function PostsList() {
  const [rows, setRows] = useState<AdminPostRow[] | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    adminApi
      .list()
      .then((r) => setRows(r.posts))
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const toggle = async (p: AdminPostRow) => {
    try {
      await adminApi.setStatus(p.id, p.status === 'published' ? 'draft' : 'published');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    }
  };
  const remove = async (p: AdminPostRow) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    try {
      await adminApi.remove(p.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-matrix-navy">Blog posts</h1>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => navigate('/admin/posts/new')}>
          <Plus size={18} /> New post
        </button>
      </div>
      {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
      {!rows ? (
        <Loader2 className="animate-spin text-slate-400" />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-600 font-medium">
          No posts yet. Click “New post” to write the first one.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
          {rows.map((p) => (
            <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="min-w-0">
                <Link to={`/admin/posts/${p.id}`} className="font-extrabold text-matrix-navy hover:text-matrix-blue-primary break-words">
                  {p.title}
                </Link>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 flex flex-wrap gap-3">
                  <span className={p.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}>{p.status}</span>
                  {p.category && <span>{p.category}</span>}
                  <span>{p.published_at ? formatDate(p.published_at) : 'not published'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.status === 'published' && (
                  <Link to={`/blog/${p.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="View on site">
                    <ExternalLink size={18} />
                  </Link>
                )}
                <button type="button" onClick={() => toggle(p)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title={p.status === 'published' ? 'Unpublish' : 'Publish'}>
                  {p.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <Link to={`/admin/posts/${p.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Edit">
                  <Pencil size={18} />
                </Link>
                <button type="button" onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SolutionsList() {
  const [rows, setRows] = useState<AdminSolutionRow[] | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const load = useCallback(() => {
    adminApi
      .listSolutions()
      .then((r) => setRows(r.pages))
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const toggle = async (p: AdminSolutionRow) => {
    try {
      await adminApi.setSolutionStatus(p.id, p.status === 'published' ? 'draft' : 'published');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    }
  };
  const remove = async (p: AdminSolutionRow) => {
    if (!window.confirm(`Delete the page “${p.title}”? This cannot be undone.`)) return;
    try {
      await adminApi.removeSolution(p.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-matrix-navy">Solution pages</h1>
        <button type="button" className="btn-primary flex items-center gap-2" onClick={() => navigate('/admin/solutions/new')}>
          <Plus size={18} /> New solution page
        </button>
      </div>
      <p className="text-sm text-slate-600 font-medium max-w-3xl">
        Write a page for any product on the Solutions page. When it is published, clicking that product opens your page. Products
        without one keep the quick “Request a Demo” card, or the existing solution page that already covers them.
      </p>
      {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
      {!rows ? (
        <Loader2 className="animate-spin text-slate-400" />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-600 font-medium">
          No solution pages yet. Click “New solution page” to write the first one.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
          {rows.map((p) => (
            <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="min-w-0">
                <Link to={`/admin/solutions/${p.id}`} className="font-extrabold text-matrix-navy hover:text-matrix-blue-primary break-words">
                  {p.title}
                </Link>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 flex flex-wrap gap-3">
                  <span className={p.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}>{p.status}</span>
                  {p.product && <span>{p.product}</span>}
                  <span>/solutions/{p.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.status === 'published' && (
                  <Link to={`/solutions/${p.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="View on site">
                    <ExternalLink size={18} />
                  </Link>
                )}
                <button type="button" onClick={() => toggle(p)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title={p.status === 'published' ? 'Unpublish' : 'Publish'}>
                  {p.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <Link to={`/admin/solutions/${p.id}`} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Edit">
                  <Pencil size={18} />
                </Link>
                <button type="button" onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SolutionEditRoute() {
  const { id } = useParams();
  return <PostEditor kind="solution" postId={id && id !== 'new' ? Number(id) : null} />;
}

function EditRoute() {
  const { id } = useParams();
  return <PostEditor postId={id && id !== 'new' ? Number(id) : null} />;
}

export default function AdminApp() {
  usePageMeta({ path: '/admin', title: 'Admin | Matrix Solutions', description: 'Matrix Solutions administration.', noindex: true });

  const [session, setSession] = useState<Session | null>(null);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    adminApi
      .status()
      .then((s) => {
        setCsrf(s.csrf);
        setSession(s);
      })
      .catch((e: Error) => setFailed(e.message));
  }, []);

  const logout = async () => {
    try {
      await adminApi.logout();
    } finally {
      setCsrf(null);
      setSession({ admin: null, csrf: null, needsSetup: false });
    }
  };

  if (failed) {
    return (
      <Shell>
        <p className="text-center text-slate-600 font-medium">{failed}</p>
      </Shell>
    );
  }
  if (!session) {
    return (
      <Shell>
        <Loader2 className="animate-spin mx-auto text-slate-400" />
      </Shell>
    );
  }
  if (!session.admin) {
    return (
      <Shell>
        <AuthForm needsSetup={session.needsSetup} onDone={setSession} />
      </Shell>
    );
  }
  return (
    <Shell user={session.admin.username} onLogout={logout}>
      <Routes>
        <Route index element={<PostsList />} />
        <Route path="posts/:id" element={<EditRoute />} />
        <Route path="solutions" element={<SolutionsList />} />
        <Route path="solutions/:id" element={<SolutionEditRoute />} />
        <Route path="*" element={<PostsList />} />
      </Routes>
    </Shell>
  );
}
