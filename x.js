console.log("%c[NICCO TOOLBOX] Loaded", "color: #00c853; font-size: 16px;");

/* ------------------------------
   1. BASIC INFO
------------------------------ */
console.log("[INFO] URL:", location.href);
console.log("[INFO] Cookies:", document.cookie);
console.log("[INFO] Origin:", location.origin);
console.log("[INFO] User-Agent:", navigator.userAgent);

/* ------------------------------
   2. DOM ENUMERATION
------------------------------ */
window.niccoEnumDOM = () => {
    let sinks = [];
    document.querySelectorAll("*").forEach(el => {
        ["innerHTML", "insertAdjacentHTML"].forEach(p => {
            if (p in el)
                sinks.push({ element: el.tagName, property: p });
        });
    });
    console.log("%c[DOM SINKS]", "color: orange;", sinks);
};
console.log("[TOOL] niccoEnumDOM() available");

/* ------------------------------
   3. REFLECTED PARAM DETECTOR
------------------------------ */
window.niccoFindReflected = () => {
    let reflected = [];
    let params = new URLSearchParams(location.search);
    params.forEach((v, k) => {
        if (document.body.innerHTML.includes(v)) {
            reflected.push({ parameter: k, value: v });
        }
    });
    console.log("%c[REFLECTED PARAMS]", "color: cyan;", reflected);
};
console.log("[TOOL] niccoFindReflected() available");

/* ------------------------------
   4. POSTMESSAGE LOGGER
------------------------------ */
window.niccoPMStop = false;

window.niccoPM = () => {
    if (window.niccoPMStop) {
        console.warn("[postMessage] already running");
        return;
    }
    window.niccoPMStop = true;
    window.addEventListener("message", e => {
        console.log("%c[postMessage]", "color: yellow;", {
            origin: e.origin,
            data: e.data
        });
    });
    console.log("[TOOL] postMessage logger ON");
};
console.log("[TOOL] niccoPM() available");

/* ------------------------------
   5. QUICK DOM DUMP
------------------------------ */
window.niccoDOM = () => {
    console.log("%c[DOM DUMP]", "color: magenta;", document.documentElement.outerHTML);
};
console.log("[TOOL] niccoDOM() available");

/* ------------------------------
   6. TEMP UI OVERLAY (debug)
------------------------------ */
window.niccoOverlay = (msg = "Injected Overlay") => {
    const d = document.createElement("div");
    d.style = `
        position:fixed;top:0;left:0;width:100%;height:60px;
        background:#000;color:#0f0;z-index:999999;padding:10px;
        font-size:18px;font-family:monospace;
    `;
    d.innerText = msg;
    document.body.appendChild(d);
};
console.log("[TOOL] niccoOverlay() available");

/* ------------------------------
   7. KEYLOGGER (DISABLED BY DEFAULT)
------------------------------ */
window.niccoKeylogOn = () => {
    window.addEventListener("keypress", e => console.log("[KEYLOG]", e.key));
    console.log("[TOOL] Keylogger ON");
};
console.log("[TOOL] niccoKeylogOn() available");

/* ------------------------------
   8. MINI COMMANDS
------------------------------ */
window.nicco = {
    info: () => console.log({ href: location.href, cookie: document.cookie }),
    dom: () => window.niccoDOM(),
    sinks: () => window.niccoEnumDOM(),
    reflected: () => window.niccoFindReflected(),
    pm: () => window.niccoPM(),
    overlay: text => window.niccoOverlay(text),
};

console.log("%c[NICCO TOOLBOX READY] Type 'nicco' in console", "color:#4caf50; font-size: 14px;");
