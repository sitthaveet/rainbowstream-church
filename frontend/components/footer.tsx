export function Footer() {
  return (
    <footer className="relative mt-8">
      {/* Spectral hairline divider */}
      <div aria-hidden className="spectral-rule h-px w-full opacity-60" />
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="font-display text-lg text-headings">ลำธารสีรุ้ง Rainbow Stream</p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Create a safe space for believers of all genders</span>
        </p>
      </div>
    </footer>
  );
}
