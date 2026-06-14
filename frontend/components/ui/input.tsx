import { cn } from "@/lib/cn";

const fieldClasses =
  "ring-spectral w-full rounded-xl border border-input bg-card/50 px-3.5 text-foreground " +
  "placeholder:text-muted-foreground transition-all duration-200 disabled:opacity-50";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClasses, "min-h-24 py-2.5", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClasses, "h-11", className)} {...props} />;
}
