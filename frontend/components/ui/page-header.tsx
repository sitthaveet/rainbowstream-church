/** Centered page title with a small spectral eyebrow + prism underline.
 *  Used at the top of the inner pages for a consistent, elevated heading. */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="text-center">
      {eyebrow && (
        <p className="text-brand font-sans text-sm font-medium">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-3xl">{title}</h1>
      <div
        aria-hidden
        className="spectral-rule mx-auto mt-3 h-0.5 w-16 rounded-full opacity-80"
      />
      {children && (
        <p className="mt-3 text-muted-foreground">{children}</p>
      )}
    </header>
  );
}
