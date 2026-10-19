import { QRCodeSVG } from "qrcode.react";

/** The LIFF deep link a check-in QR encodes — opens /checkin inside LINE. */
export function checkinUrl(checkinCode: string): string {
  return `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/checkin?code=${checkinCode}`;
}

/** A check-in QR in a spectral frame around an always-white tile, so the code
 *  scans reliably in dark mode too. */
export function CheckinQr({ url, size = 224 }: { url: string; size?: number }) {
  return (
    <div
      className="mx-auto w-fit rounded-2xl p-[3px] shadow-lg shadow-primary/15"
      style={{ background: "var(--gradient-conic)" }}
    >
      <div className="rounded-[calc(1rem-1px)] bg-white p-5">
        <QRCodeSVG value={url} size={size} marginSize={1} />
      </div>
    </div>
  );
}
