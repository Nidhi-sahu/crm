import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../modules/crm/auth/hooks/useAuth';
import { DASHBOARD_GROUP, DASHBOARD_PATH, ICON_PATHS } from './menuConfig';

const NavIcon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={ICON_PATHS[name] || ''}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Zm4 4a2 2 0 0 0 4 0"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-300 text-slate-700">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 20V9.5L12 4l8 5.5V20H14v-6h-4v6H4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-900">CRM</p>
  </div>
);

const childItemClasses = ({ isActive }) =>
  [
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-brand-100 text-brand-600 font-semibold'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
  ].join(' ');

function SidebarNav({ visibleChildren, onNavigate, expanded, setExpanded }) {
  return (
    <nav className="space-y-1">
      <div>
        <NavLink
          to={DASHBOARD_PATH}
          onClick={() => {
            if (visibleChildren.length > 0) setExpanded((v) => !v);
            if (onNavigate) onNavigate();
          }}
          end
          className={({ isActive }) =>
            [
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-brand-100 text-brand-600 font-semibold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')
          }
        >
          <span className="shrink-0">
            <NavIcon name={DASHBOARD_GROUP.iconKey} />
          </span>
          <span>{DASHBOARD_GROUP.label}</span>
        </NavLink>

        {expanded && visibleChildren.length > 0 && (
          <ul className="mt-1 space-y-0.5 border-l border-slate-100 pl-3.5">
            {visibleChildren.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={onNavigate} className={childItemClasses}>
                  <span className="shrink-0 text-slate-400">
                    <NavIcon name={item.iconKey} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleName = user?.role?.name || user?.roleName || 'Member';
  const displayName = user?.name || user?.email || 'User';
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-slate-100"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-300 text-sm font-semibold text-slate-800">
          {initials || '?'}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs font-semibold text-slate-900">{displayName}</span>
          <span className="block text-[11px] text-slate-500">{roleName}</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`hidden text-slate-400 transition-transform sm:block ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <p className="mt-1 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-600">
              {roleName}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 12H3m12 0-3-3m3 3-3 3M9 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [groupExpanded, setGroupExpanded] = useState(false);

  const visibleChildren = DASHBOARD_GROUP.children.filter(
    (item) => !item.requires || can(item.requires),
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <div className="mb-6">
          <Brand />
        </div>
        <SidebarNav
          visibleChildren={visibleChildren}
          expanded={groupExpanded}
          setExpanded={setGroupExpanded}
        />
        <div className="mt-auto rounded-xl bg-brand-100 p-3 text-xs text-slate-700">
          Signed in as{' '}
          <span className="font-semibold text-slate-900">
            {user?.role?.name || user?.roleName || 'Member'}
          </span>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white p-5 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <CloseIcon />
              </button>
            </div>
            <SidebarNav
              visibleChildren={visibleChildren}
              onNavigate={() => setDrawerOpen(false)}
              expanded={groupExpanded}
              setExpanded={setGroupExpanded}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            {/* mobile menu */}
            <button
              type="button"
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>

            {/* search */}
            <div className="hidden flex-1 sm:flex">
              <label className="relative flex w-full max-w-md items-center">
                <span className="pointer-events-none absolute left-3 text-slate-400">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  placeholder="Search leads, enquiries, users…"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>
            </div>
            <div className="flex flex-1 sm:hidden">
              <button
                type="button"
                aria-label="Search"
                className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <SearchIcon />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Notifications"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
              >
                <BellIcon />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
