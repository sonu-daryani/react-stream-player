const STYLE_ID = "hls-react-player-base-styles";

const BASE_STYLES = `
.rsp-root{overflow:hidden;border-radius:16px;border:1px solid #1e2a44;background:#060b16;box-shadow:0 25px 70px rgba(0,0,0,.65)}
.rsp-embed-root{overflow:hidden;background:#000}
.rsp-frame{position:relative}
.rsp-video{display:block;width:100%;aspect-ratio:16/9;background:#000}
.rsp-top-overlay{pointer-events:none;position:absolute;inset:0 0 auto 0;padding:16px;background:linear-gradient(to bottom,rgba(2,8,23,.95),rgba(2,8,23,.45),transparent)}
.rsp-bottom-overlay{position:absolute;inset:auto 0 0 0;padding:16px;background:linear-gradient(to top,rgba(2,8,23,1),rgba(2,8,23,.9),transparent)}
.rsp-top-inner{display:flex;align-items:flex-start;justify-content:space-between}
.rsp-title{margin:0;color:#fff;font-size:14px;font-weight:600}
.rsp-fade-overlay{transition:opacity .3s ease}
.rsp-visible{opacity:1}
.rsp-hidden{opacity:0;pointer-events:none}
.rsp-buffer-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,8,23,.45)}
.rsp-buffer-chip{display:flex;align-items:center;gap:12px;border-radius:999px;border:1px solid rgba(147,197,253,.2);background:rgba(15,23,42,.85);padding:8px 16px;color:#fff;font-size:14px}
.rsp-spinner{width:16px;height:16px;border:2px solid #bfdbfe;border-top-color:transparent;border-radius:50%;animation:rsp-spin .8s linear infinite}
@keyframes rsp-spin{to{transform:rotate(360deg)}}
.rsp-center-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}
.rsp-main-play-btn{pointer-events:auto;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(15,23,42,.8);color:#fff;padding:14px 22px;cursor:pointer}
.rsp-progress{width:100%;height:6px;cursor:pointer;border-radius:999px;appearance:none;-webkit-appearance:none}
.rsp-controls-row{margin-top:16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;color:#fff}
.rsp-left-controls,.rsp-right-controls,.rsp-logo-pill,.rsp-time-pill,.rsp-volume-group,.rsp-btn-chip{border:1px solid rgba(255,255,255,.15);background:rgba(15,23,42,.9);backdrop-filter:blur(8px)}
.rsp-left-controls{display:flex;align-items:center;gap:8px;border-radius:999px;padding:6px 8px}
.rsp-right-controls{margin-left:auto;display:flex;align-items:center;gap:8px;border-radius:999px;padding:4px}
.rsp-btn{border:none;cursor:pointer;color:#fff}
.rsp-btn:hover{background-color:rgba(255,255,255,.12)}
.rsp-btn-ghost{background:transparent;border-radius:999px;padding:6px 12px}
.rsp-btn-primary{border-radius:999px;background:#3b82f6;padding:8px 14px;font-weight:600}
.rsp-btn-primary:hover{background:#60a5fa}
.rsp-btn-chip{border-radius:999px;padding:8px 12px}
.rsp-btn-icon-group{display:inline-flex;align-items:center;gap:4px}
.rsp-btn-caption{font-size:12px}
.rsp-relative{position:relative}
.rsp-settings-menu{position:absolute;right:0;bottom:calc(100% + 8px);z-index:20;width:224px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:rgba(11,18,34,.95);padding:12px}
.rsp-settings-group + .rsp-settings-group{margin-top:12px}
.rsp-select-label{display:block;margin-bottom:6px;color:#cbd5e1;font-size:12px}
.rsp-select{width:100%;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:#0f172a;color:#fff;padding:6px 8px}
.rsp-logo-pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:600}
.rsp-volume-group{position:relative;display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:8px 10px}
.rsp-icon-btn{border:none;border-radius:999px;background:transparent;color:#fff;cursor:pointer;display:inline-flex}
.rsp-volume-slider-popover{position:absolute;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%);border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(15,23,42,.95);padding:8px;opacity:0;pointer-events:none;transition:opacity .2s ease}
.rsp-volume-group:hover .rsp-volume-slider-popover,.rsp-volume-group:focus-within .rsp-volume-slider-popover{opacity:1;pointer-events:auto}
.rsp-volume-slider{width:6px;height:96px;appearance:none;-webkit-appearance:none}
.rsp-time-pill{border-radius:999px;padding:8px 12px;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.85)}
`;

export const ensureStreamPlayerStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const styleEl = document.createElement("style");
  styleEl.id = STYLE_ID;
  styleEl.textContent = BASE_STYLES;
  document.head.appendChild(styleEl);
};

