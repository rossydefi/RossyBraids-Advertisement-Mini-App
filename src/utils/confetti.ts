const COLORS = ['#D4AF37', '#F5E6A3', '#FF4D8D', '#7C4DFF', '#00C2A8', '#FF9F1C', '#3DA5FF', '#FF5A5F'];

/** A short burst of coloured confetti from the middle of an element (or the click point). Skipped if the user prefers reduced motion. */
/** Returns true if the burst was played. */
export function confettiBurst(origin: HTMLElement | { x: number; y: number }, count = 48): boolean {
  if (typeof document === 'undefined' || typeof document.body.animate !== 'function') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;

  let x: number;
  let y: number;
  if (origin instanceof HTMLElement) {
    const r = origin.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top + r.height / 2;
  } else {
    ({ x, y } = origin);
  }

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
  document.body.appendChild(layer);

  let remaining = count;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    const size = 6 + Math.random() * 7;
    const round = Math.random() < 0.35;
    piece.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${round ? size : size * 0.45}px;background:${
      COLORS[i % COLORS.length]
    };border-radius:${round ? '50%' : '2px'};will-change:transform,opacity`;
    layer.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 170;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 60; // burst upward, then fall
    const spin = (Math.random() - 0.5) * 900;
    const anim = piece.animate(
      [
        { transform: 'translate(-50%,-50%) scale(0.3) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx - size / 2}px,${dy}px) scale(1) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx * 1.15 - size / 2}px,${dy + 150 + Math.random() * 90}px) scale(0.8) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards' }
    );
    anim.onfinish = () => {
      if (--remaining === 0) layer.remove();
    };
  }
  return true;
}
