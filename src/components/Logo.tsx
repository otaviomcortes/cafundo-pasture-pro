interface LogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
}

export function Logo({ variant = "light", showText = true }: LogoProps) {
  const textColor = variant === "light" ? "text-sidebar-foreground" : "text-foreground";
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/70 shadow-md">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent-foreground" fill="currentColor">
          {/* Stylized cow head silhouette */}
          <path d="M12 3c-2.5 0-4.5 1.5-5.2 3.6C5.2 6.2 3.5 7 3 8.5c-.4 1.4.4 2.8 1.8 3.2.2 1.5 1 2.9 2.2 3.9V18c0 1.1.9 2 2 2h1v-2h4v2h1c1.1 0 2-.9 2-2v-2.4c1.2-1 2-2.4 2.2-3.9 1.4-.4 2.2-1.8 1.8-3.2-.5-1.5-2.2-2.3-3.8-1.9C16.5 4.5 14.5 3 12 3zm-2.5 7a1 1 0 110 2 1 1 0 010-2zm5 0a1 1 0 110 2 1 1 0 010-2z"/>
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display text-lg font-bold tracking-tight ${textColor}`}>
            Cafundó
          </span>
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
            Gestão Pecuária
          </span>
        </div>
      )}
    </div>
  );
}
