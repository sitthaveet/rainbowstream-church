import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/70 p-4 text-card-foreground backdrop-blur-sm",
        "shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_28px_-20px_rgb(0_0_0/0.25)]",
        "transition-[transform,box-shadow,background-color,border-color] duration-200",
        className,
      )}
      {...props}
    />
  );
}
