import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  // Spectral brand gradient with a sheen sweep on hover (see base classes)
  primary:
    "text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 " +
    "[background-image:var(--gradient-brand)] hover:brightness-105 active:brightness-95",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-muted border border-border/60",
  outline:
    "border border-border bg-card/40 text-foreground hover:bg-shade hover:border-decoration/40",
  ghost: "bg-transparent text-foreground hover:bg-shade",
  destructive:
    "bg-error-accent text-white shadow-lg shadow-error-accent/20 hover:brightness-105 active:brightness-95",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 rounded-xl",
  lg: "h-13 px-7 text-lg rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      className={cn(
        "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden font-sans font-medium",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        // Sheen: a soft light sweep that crosses primary/destructive on hover
        (isPrimary || variant === "destructive") &&
          "before:absolute before:inset-0 before:-z-10 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 before:content-[''] hover:before:translate-x-full",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
