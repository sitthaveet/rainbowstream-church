import { cn } from "@/lib/cn";

type Variant = "default" | "accent" | "muted" | "success" | "error";

const variants: Record<Variant, string> = {
  default: "bg-shade",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  success: "bg-success text-success-foreground",
  error: "bg-error text-error-foreground",
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
        "rounded-xl p-4 leading-7",
        leading != null && "flex items-start gap-3",
        variants[variant],
        className,
      )}
      {...props}
    >
      {leading != null && <div className="shrink-0 mt-0.5">{leading}</div>}
      {leading != null ? <div className="min-w-0">{children}</div> : children}
    </div>
  );
}
