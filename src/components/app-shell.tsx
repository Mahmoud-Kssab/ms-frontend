'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';

import { HasPermission } from '@/features/rbac/components/has-permission';
import { PERMISSIONS } from '@/features/rbac/constants/permissions';
import { usePermissionContext } from '@/features/rbac/providers/permission-provider';

interface AppShellProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/',
    label: 'Inbox',
    icon: Inbox,
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: Users,
    permission: PERMISSIONS.UserRead,
  },
  {
    href: '/admin/roles',
    label: 'Roles',
    icon: ShieldCheck,
    permission: PERMISSIONS.RoleRead,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    permission: PERMISSIONS.SettingsManage,
  },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { logout, user } = usePermissionContext();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-white px-4 py-5 md:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
            <ShieldCheck aria-hidden="true" size={21} />
          </span>
          <span className="text-base font-semibold">Messaging SaaS</span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium',
                  isActive
                    ? 'bg-ink text-white'
                    : 'text-muted hover:bg-surface hover:text-ink',
                ].join(' ')}
              >
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </Link>
            );

            if (!item.permission) {
              return link;
            }

            return (
              <HasPermission key={item.href} permission={item.permission}>
                {link}
              </HasPermission>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-3">
          <UserCircle aria-hidden="true" className="text-muted" size={22} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Loading user'}</p>
            <p className="truncate text-xs text-muted">{user?.email ?? 'Session'}</p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-muted hover:bg-white hover:text-ink"
            >
              Logout
            </button>
          ) : null}
        </div>
      </aside>

      <div className="md:pl-64">{children}</div>
    </div>
  );
}
