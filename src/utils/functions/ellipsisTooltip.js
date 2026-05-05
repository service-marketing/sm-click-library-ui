export function showEllipsisTooltip(event) {
  const el = event.currentTarget;
  if (el.scrollWidth <= el.offsetWidth) return;

  let tip = document.getElementById("sm-ellipsis-tip");
  if (!tip) {
    tip = document.createElement("div");
    tip.id = "sm-ellipsis-tip";
    tip.style.cssText = [
      "position:fixed",
      "z-index:9999",
      "background:#30424d",
      "color:#fff",
      "padding:4px 8px",
      "border-radius:6px",
      "font-size:0.75rem",
      "pointer-events:none",
      "opacity:0",
      "transition:opacity 0.1s ease",
      "max-width:300px",
      "word-break:break-word",
      "box-shadow:0 2px 8px rgba(0,0,0,0.3)",
      "line-height:1.4",
      "white-space:normal",
    ].join(";");
    document.body.appendChild(tip);
  }

  tip.textContent = el.textContent.trim();
  tip.style.opacity = "0";

  requestAnimationFrame(() => {
    const elRect = el.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let top = elRect.top - tipRect.height - 6;
    let left = elRect.left;
    if (top < 4) top = elRect.bottom + 6;
    if (left + tipRect.width > window.innerWidth - 4)
      left = window.innerWidth - tipRect.width - 4;
    if (left < 4) left = 4;
    tip.style.top = top + "px";
    tip.style.left = left + "px";
    tip.style.opacity = "1";
  });
}

export function hideEllipsisTooltip() {
  const tip = document.getElementById("sm-ellipsis-tip");
  if (tip) tip.style.opacity = "0";
}
