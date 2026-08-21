export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="font-display text-[26px] font-semibold italic tracking-tight text-ink">
            North
          </span>
          <p className="text-[13px] text-muted">
            The operating system for the life you&apos;re building.
          </p>
        </div>
        <div className="rounded-[20px] border border-line bg-surface p-7 shadow-north-md">
          {children}
        </div>
      </div>
    </div>
  );
}
