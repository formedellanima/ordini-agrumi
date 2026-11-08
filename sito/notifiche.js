/* =====================================================================
   Notifiche al gestore — modulo generico condiviso da index.html e ordina.html.

   Un EVENTO descrive cosa è successo, senza sapere come verrà recapitato:
     {tipo:'nuova_prenotazione', titolo, messaggio, link}

   Un CANALE è un modo di recapitarlo. Ogni canale configurato dal gestore
   è salvato in impostazioni/generale.notifiche come {tipo, attivo, ...campi}.

   Per aggiungere un canale (per esempio l'email) basta registrare un nuovo
   "fornitore" con Notifiche.registra({...}) e i campi che servono: la scheda
   Impostazioni del gestore lo mostra da sola.

   Dove parte l'invio — campo `lato` del fornitore:
     'cliente'  la configurazione è pubblica (copiata nella pagina dei clienti)
                e l'invio parte dal telefono di chi prenota. Esempio: ntfy.
     'server'   la configurazione contiene segreti (chiavi, password) e NON
                viene mai pubblicata: l'invio va fatto da un server che legge
                impostazioni/generale, per esempio una Cloud Function di
                Firebase su "nuova prenotazione" (richiede il piano Blaze).
                Esempio futuro: email con SendGrid/Brevo.
   ===================================================================== */
(() => {
  const FORNITORI = {};

  function registra(f){ FORNITORI[f.tipo] = f; }

  // Canali attivi e configurati, eventualmente solo di un lato.
  function attivi(canali, lato){
    return (canali || []).filter(c => {
      const f = FORNITORI[c.tipo];
      return f && c.attivo !== false && (!lato || f.lato === lato) && !f.valida(c);
    });
  }

  // Configurazione sicura da pubblicare nella pagina dei clienti.
  function pubblici(canali){
    return attivi(canali, 'cliente').map(c => {
      const f = FORNITORI[c.tipo], o = {tipo:c.tipo};
      for (const k of f.campi.map(x => x.k)) o[k] = c[k];
      return o;
    });
  }

  // Invia l'evento a tutti i canali; non lancia mai errori.
  async function invia(canali, evento){
    const esiti = await Promise.all(attivi(canali).map(async c => {
      const f = FORNITORI[c.tipo];
      if (f.lato !== 'cliente') return {tipo:c.tipo, ok:false, motivo:'Invio dal server, non da questa pagina'};
      try { await f.invia(c, evento); return {tipo:c.tipo, ok:true}; }
      catch (e) { return {tipo:c.tipo, ok:false, motivo:String(e?.message || e)}; }
    }));
    return esiti;
  }

  // Evento standard per una nuova prenotazione.
  function nuovaPrenotazione({ordinazione, prodotti, totale, link}){
    return {
      tipo: 'nuova_prenotazione',
      titolo: 'Nuova prenotazione',
      messaggio: `${ordinazione}\n${prodotti} prodott${prodotti === 1 ? 'o' : 'i'} · totale ${new Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR'}).format(totale || 0)}`,
      link: link || '',
    };
  }

  /* ---------- fornitore: notifica push con l'app ntfy ---------- */
  registra({
    tipo: 'ntfy',
    nome: 'Notifica push sull\'iPhone (app ntfy)',
    lato: 'cliente',
    istruzioni: '1. Installa l\'app gratuita <b>ntfy</b> dall\'App Store. 2. Premi <b>Genera</b>, poi <b>Copia</b>. 3. In ntfy tocca <b>+</b>, incolla il nome e conferma (server predefinito ntfy.sh). 4. Salva e premi <b>Invia prova</b>. Le notifiche non contengono nomi né telefoni.',
    campi: [{
      k: 'topic', label: 'Nome del canale', placeholder: 'Premi Genera',
      genera: () => { const a = new Uint8Array(9); crypto.getRandomValues(a); return 'agrumi-' + [...a].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 16); },
    }],
    valida: c => /^[A-Za-z0-9_-]{8,64}$/.test(c.topic || '') ? '' : 'Il nome del canale può avere solo lettere, numeri, - e _ (almeno 8).',
    invia: async (c, ev) => {
      // Corpo JSON senza intestazioni personalizzate: richiesta "semplice", niente blocchi CORS.
      const r = await fetch('https://ntfy.sh/', {method:'POST', keepalive:true, body:JSON.stringify({
        topic: c.topic, title: ev.titolo, message: ev.messaggio, tags: ['tangerine'], ...(ev.link ? {click: ev.link} : {}),
      })});
      if (!r.ok) throw new Error('ntfy ha risposto ' + r.status);
    },
  });

  /* ---------- esempio per il futuro (non attivo) ----------
  registra({
    tipo: 'email', nome: 'Email', lato: 'server',
    istruzioni: 'Richiede una Cloud Function che legga questi dati e invii la mail.',
    campi: [{k:'indirizzo', label:'Indirizzo email', placeholder:'nome@esempio.it'}],
    valida: c => /.+@.+\..+/.test(c.indirizzo || '') ? '' : 'Indirizzo email non valido.',
    invia: async () => { throw new Error('Inviata dal server'); },
  });
  ---------------------------------------------------------- */

  window.Notifiche = {registra, fornitori: () => Object.values(FORNITORI), attivi, pubblici, invia, nuovaPrenotazione};
})();
