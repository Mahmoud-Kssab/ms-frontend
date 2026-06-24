'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Lock } from 'lucide-react';

import { usePermissionContext } from '../providers/permission-provider';
import { PermissionKey } from '../types/rbac';

interface PermissionActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  permission: PermissionKey;
  children: ReactNode;
  deniedReason?: string;
}

export function PermissionAction({
  permission,
  children,
  deniedReason = 'You do not have permission to perform this action.',
  disabled,
  className = '',
  ...buttonProps
}: PermissionActionProps) {
  const { hasPermission } = usePermissionContext();
  const isAllowed = hasPermission(permission);
  const isDisabled = disabled || !isAllowed;

  return (
    <span className="inline-flex" title={isAllowed ? undefined : deniedReason}>
      <button
        {...buttonProps}
        aria-disabled={isDisabled}
        disabled={isDisabled}
        className={[
          className,
          isDisabled ? 'cursor-not-allowed opacity-55' : '',
        ].join(' ')}
      >
        {!isAllowed ? <Lock aria-hidden="true" size={14} /> : null}
        {children}
      </button>
    </span>
  );
}
