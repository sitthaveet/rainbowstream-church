import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatEventRange } from "@/lib/format";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    location?: string | null;
    startsAt: string;
    endsAt?: string | null;
  };
  href?: string;
}

export function EventCard({ event, href }: EventCardProps) {
  const body = (
    <Card
      className={cn(
        "relative overflow-hidden pl-5",
        href &&
          "hover:-translate-y-0.5 hover:border-decoration/40 hover:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_36px_-22px_var(--spectrum-1)]",
      )}
    >
      {/* Spectral edge — the prism catching the card */}
      <span
        aria-hidden
        className="spectral-rule absolute inset-y-0 left-0 w-1.5"
      />
      <h3 className="text-lg leading-snug">{event.title}</h3>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <span aria-hidden>🗓️</span>
        {formatEventRange(event.startsAt, event.endsAt)}
      </p>
      {event.location && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span aria-hidden>📍</span>
          {event.location}
        </p>
      )}
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
