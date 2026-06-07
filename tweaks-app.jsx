/* Tweaks app — drives CSS variables on :root. Vanilla page reads them. */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#EA8A3E",
  "fontScale": 1,
  "motion": "full",
  "density": "regular"
}/*EDITMODE-END*/;

const ACCENTS = [
  "#EA8A3E", // amber (default)
  "#D9694A", // terracotta
  "#5DAE7E", // sage
  "#5B8DEF", // azure
  "#9B7BE8", // violet
];
const MOTION_MAP = { full: 1, subtle: 0.45, off: 0 };
const DENSITY_MAP = { compact: 0.78, regular: 1, comfy: 1.22 };

function applyTweaks(t) {
  const r = document.documentElement;
  const a = t.accent || "#EA8A3E";
  r.style.setProperty("--accent", a);
  r.style.setProperty("--accent-dim", `color-mix(in oklab, ${a} 80%, #000)`);
  r.style.setProperty("--accent-fg", "#1a1410");
  r.style.setProperty("--accent-tint", `color-mix(in oklab, ${a} 14%, transparent)`);
  r.style.setProperty("--fs", String(t.fontScale ?? 1));
  r.style.setProperty("--motion", String(MOTION_MAP[t.motion] ?? 1));
  r.style.setProperty("--space", String(DENSITY_MAP[t.density] ?? 1));
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);
  return (
    <TweaksPanel>
      <TweakSection label="Accent" />
      <TweakColor label="Color" value={t.accent} options={ACCENTS}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Type & rhythm" />
      <TweakSlider label="Text size" value={t.fontScale} min={0.9} max={1.15} step={0.05}
        onChange={(v) => setTweak("fontScale", v)} />
      <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]}
        onChange={(v) => setTweak("density", v)} />
      <TweakSection label="Motion" />
      <TweakRadio label="Animation" value={t.motion} options={["full", "subtle", "off"]}
        onChange={(v) => setTweak("motion", v)} />
    </TweaksPanel>
  );
}

// TWEAK_DEFAULTS already reflects persisted values (host rewrites the block on disk),
// so apply immediately before React mounts to avoid a flash.
applyTweaks(TWEAK_DEFAULTS);

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<TweaksApp />);
