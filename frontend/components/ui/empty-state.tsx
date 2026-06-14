export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-border/80 bg-shade/50 px-6 py-12 text-center backdrop-blur-sm">
      {/* faint spectral wash from below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-30 [background:radial-gradient(60%_100%_at_50%_100%,var(--spectrum-1),transparent_70%)]"
      />
      {icon && (
        <div className="relative grid size-14 place-items-center rounded-full border border-border/60 bg-card/70 text-3xl shadow-sm">
          {icon}
        </div>
      )}
      <p className="font-display text-lg text-headings">{title}</p>
      {children && (
        <div className="max-w-xs text-sm text-muted-foreground">{children}</div>
      )}
    </div>
  );
}
