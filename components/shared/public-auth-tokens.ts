export const publicAuthSurface = Object.freeze({
    eyebrow:
        "inline-flex items-center gap-2 rounded-full border border-(--border) bg-white/84 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-(--accent-primary) shadow-(--shadow-xs) backdrop-blur-sm",
    panel:
        "rounded-[calc(var(--radius-3xl)+0.5rem)] border border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.82))] shadow-(--shadow-lg) backdrop-blur-xl",
    panelSoft:
        "rounded-[1.35rem] border border-(--border-light) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.9))] shadow-(--shadow-xs)",
    fieldShell:
        "relative flex items-center overflow-hidden rounded-t-xl bg-[var(--bg-public-muted)] px-4",
    fieldInput:
        "w-full border-b-2 border-(--border) bg-transparent px-0 py-4 text-[var(--text-primary)] outline-none transition-all duration-300 appearance-none rounded-none focus:border-(--accent-primary) focus:ring-0",
    iconButton:
        "inline-flex h-9 w-9 items-center justify-center rounded-full text-(--text-secondary) transition-colors duration-200 hover:bg-[var(--bg-public-muted)] hover:text-(--accent-primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)",
    primaryButton:
        "w-full rounded-xl bg-linear-to-t from-[#672200] to-[#8d3100] px-6 py-5 text-sm font-bold uppercase tracking-[0.26em] text-white shadow-xl shadow-[#672200]/10 transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
    secondaryButton:
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-(--border) bg-white px-5 py-3 text-sm font-semibold text-(--text-primary) shadow-(--shadow-sm) transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-hover)",
    textLink: "font-bold text-(--text-link) transition-all hover:underline underline-offset-4",
});

export const publicAuthTonePanels = Object.freeze({
    default: "border-(--border) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,249,247,0.92))]",
    success: "border-[rgba(19,135,108,0.18)] bg-[linear-gradient(180deg,rgba(236,249,245,0.98),rgba(226,245,238,0.92))]",
    warning: "border-[rgba(251,193,23,0.26)] bg-[linear-gradient(180deg,rgba(255,248,222,0.98),rgba(255,243,203,0.92))]",
    danger: "border-[rgba(217,79,61,0.18)] bg-[linear-gradient(180deg,rgba(255,242,239,0.98),rgba(255,232,227,0.92))]",
} as const);

export const publicAuthToneMessages = Object.freeze({
    default: "border-(--border) bg-white/90 text-(--text-secondary)",
    success: "border-[rgba(19,135,108,0.2)] bg-(--success-bg) text-(--success-text)",
    warning: "border-[rgba(251,193,23,0.28)] bg-(--warning-bg) text-(--warning-text)",
    danger: "border-[rgba(217,79,61,0.22)] bg-(--error-bg) text-(--error-text)",
} as const);
