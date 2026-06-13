import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-lg border border-input bg-background px-3 text-foreground " +
  "placeholder:text-muted-foreground transition-colors duration-150 " +
  "focus:outline-2 focus:outline-offset-1 focus:outline-ring disabled:opacity-50";

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
      className={cn(fieldClasses, "min-h-24 py-2", className)}
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
