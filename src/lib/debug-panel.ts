/**
 * Layout diagnostics, only loaded when the address ends in ?debug (a separate small file,
 * never downloaded otherwise). Shows where the browser placed the hero and the logo, so a
 * phone screenshot is enough to see layout problems on devices we can't test directly.
 */
export function showDebugPanel() {
  const panel = document.createElement('pre');
  const s = panel.style;
  s.position = 'fixed';
  s.left = '4px';
  s.right = '4px';
  s.bottom = '4px';
  s.zIndex = '9999';
  s.margin = '0';
  s.padding = '6px 8px';
  s.font = '10px/1.35 ui-monospace, Menlo, monospace';
  s.whiteSpace = 'pre-wrap';
  s.wordBreak = 'break-all';
  s.background = 'rgba(255,255,255,0.94)';
  s.color = '#000';
  s.border = '1px solid #000';
  s.pointerEvents = 'none';
  document.body.append(panel);

  const rect = (sel: string) => {
    const e = document.querySelector(sel);
    if (!e) return `${sel}: missing`;
    const r = e.getBoundingClientRect();
    return `${sel}: x${r.x.toFixed(1)} y${r.y.toFixed(1)} w${r.width.toFixed(1)} h${r.height.toFixed(1)}`;
  };
  const css = (sel: string, ...props: string[]) => {
    const e = document.querySelector(sel);
    if (!e) return '';
    const c = getComputedStyle(e);
    return `${sel} {${props.map((p) => `${p}:${c.getPropertyValue(p)}`).join('; ')}}`;
  };

  const update = () => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    panel.textContent = [
      navigator.userAgent,
      `inner ${innerWidth}x${innerHeight} dpr${devicePixelRatio} client ${root.clientWidth}x${root.clientHeight} scrollW ${root.scrollWidth} scrollX ${scrollX} scrollY ${Math.round(scrollY)}`,
      vv
        ? `visual ${vv.width.toFixed(1)}x${vv.height.toFixed(1)} scale${vv.scale.toFixed(3)} offL${vv.offsetLeft.toFixed(1)} pageL${vv.pageLeft.toFixed(1)}`
        : 'visualViewport: n/a',
      `reduce-motion ${matchMedia('(prefers-reduced-motion: reduce)').matches} touch ${matchMedia('(hover: none), (pointer: coarse)').matches}`,
      rect('[data-hero]'),
      rect('[data-evasive-logo]'),
      rect('.logo__h1'),
      rect('[data-logo-button]'),
      rect('[data-logo-mover]'),
      rect('.logo__svg'),
      rect('[data-slogan]'),
      rect('[data-slogan-text]'),
      css('[data-hero]', 'display', 'place-items', 'width', 'padding-left'),
      css('[data-evasive-logo]', 'display', 'place-items', 'width', 'justify-self'),
      css('[data-logo-button]', 'width', 'height', 'aspect-ratio', 'display'),
      css('[data-logo-mover]', 'transform', 'width'),
      css('[data-slogan]', 'position', 'left', 'width', 'translate'),
      `--logo-h: ${getComputedStyle(root).getPropertyValue('--logo-h')}  classes: ${document.querySelector('[data-evasive-logo]')?.className}`,
    ].join('\n');
  };
  update();
  setInterval(update, 500);
}
