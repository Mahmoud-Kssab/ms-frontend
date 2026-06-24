import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <section className="w-full max-w-md rounded-md border border-border bg-white p-6 text-center shadow-panel">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-100 text-danger">
          <ShieldAlert aria-hidden="true" size={24} />
        </div>
        <h1 className="mt-5 text-xl font-semibold">Unauthorized</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your current role does not include the permission required for this page.
          API authorization still validates every protected action.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-medium text-white"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
