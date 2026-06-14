import { cn } from "@/lib/cn";

type Variant = "default" | "accent" | "muted" | "success" | "error";

const variants: Record<Variant, string> = {
  default: "bg-shade/80 border-border/70",
  accent:
    "bg-accent/70 text-accent-foreground border-decoration/25 ring-1 ring-inset ring-decoration/10",
  muted: "bg-muted/70 text-muted-foreground border-border/70",
  success:
    "bg-success/70 text-success-foreground border-success-accent/30 ring-1 ring-inset ring-success-accent/15",
  error:
    "bg-error/70 text-error-foreground border-error-accent/30 ring-1 ring-inset ring-error-accent/15",
};

/** Rounded filled panel with an optional leading slot (DESIGN.md callout). */
export function Callout({
  variant = "default",
  leading,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  leading?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 leading-7 backdrop-blur-sm",
        leading != null && "flex items-start gap-3",
        variants[variant],
        className,
      )}
      {...props}
    >
      {leading != null && <div className="mt-0.5 shrink-0 text-lg">{leading}</div>}
      {leading != null ? <div className="min-w-0">{children}</div> : children}
    </div>
  );
}
