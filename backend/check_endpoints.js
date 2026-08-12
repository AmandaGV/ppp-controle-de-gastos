async function fetchJson(path, method = 'GET') {
  const url = `http://localhost:3000${path}`;
  try {
    const res = await fetch(url, { method });
    const json = await res.json();
    return json;
  } catch (err) {
    return { error: String(err) };
  }
}

(async () => {
  const endpoints = [
    '/api/sistema/init',
    '/api/sistema/reload',
    '/api/sistema/planilha',
    '/api/despesas/meses',
    '/api/despesas/categorias',
    '/api/meios-pagamento',
  ];

  for (const ep of endpoints) {
    const method = ep === '/api/sistema/init' || ep === '/api/sistema/reload' ? 'POST' : 'GET';
    console.log('---', method, ep);
    const j = await fetchJson(ep, method);
    if (j && j.error) {
      console.error('ERROR:', j.error);
    } else if (Array.isArray(j)) {
      console.log(`Array length: ${j.length}`);
      console.log(JSON.stringify(j.slice(0, 5), null, 2));
    } else {
      // print small summary
      const keys = Object.keys(j || {}).slice(0, 20);
      console.log('Keys:', keys.join(', '));
      if (j && j.rows) {
        console.log('rows:', Array.isArray(j.rows) ? j.rows.length : typeof j.rows);
        console.log('months:', Array.isArray(j.months) ? j.months.length : typeof j.months);
      } else {
        console.log(JSON.stringify(j, null, 2).slice(0, 1000));
      }
    }
  }
})();
