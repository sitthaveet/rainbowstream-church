import Link from "next/link";
import { Card } from "@/components/ui/card";
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
    <Card className={href ? "transition-colors duration-150 hover:bg-shade" : undefined}>
      <h3 className="text-lg">{event.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        🗓️ {formatEventRange(event.startsAt, event.endsAt)}
      </p>
      {event.location && (
        <p className="mt-1 text-sm text-muted-foreground">📍 {event.location}</p>
      )}
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
