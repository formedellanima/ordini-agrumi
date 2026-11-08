# Ordini Agrumi Bio — installazione con Firebase e GitHub Pages

Tre pagine web che usano lo stesso database Firebase:

| Pagina | Per chi | Indirizzo |
|---|---|---|
| `index.html` | Tu (gestore), con email e password | `https://TUONOME.github.io/ordini-agrumi/` |
| `ordina.html` | I clienti del gruppo WhatsApp, senza account | `https://TUONOME.github.io/ordini-agrumi/ordina.html` |
| `stato.html` | Il singolo cliente, dal link ricevuto dopo la prenotazione | `…/stato.html?p=CODICE` |

Quando un cliente prenota dal link:
- la prenotazione compare subito nell'app del gestore, con l'etichetta **Nuova**;
- le quantità e i conti dell'ordinazione si aggiornano da soli;
- sull'iPhone arriva una notifica tramite l'app gratuita **ntfy**;
- il cliente riceve un **link personale** per seguire lo stato della prenotazione: vista dal gestore, ordine al fornitore, consegnata, pagata o da pagare.

Servono circa 20 minuti, una volta sola. Firebase e GitHub sono gratuiti e non chiedono la carta di credito.

**Il codice è generico.** I dati del tuo progetto Firebase non sono scritti nei file: stanno nelle **variabili del repository GitHub**. A ogni pubblicazione GitHub Actions le legge e crea `sito/config.js` solo nella copia online. Chi vuole riusare il codice lo copia, imposta le proprie variabili e mette il proprio UID nelle regole.

| Variabile | Dove la trovi in Firebase | Obbligatoria |
|---|---|---|
| `FIREBASE_API_KEY` | `apiKey` nella configurazione dell'app web | sì |
| `FIREBASE_PROJECT_ID` | `projectId` | sì |
| `FIREBASE_APP_ID` | `appId` | sì |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` | no: se manca vale `PROGETTO.firebaseapp.com` |

> ⚠️ Nel repository vanno **solo**: la cartella `sito`, il file `firestore.rules`, questa guida e il file di pubblicazione del punto 5. Non caricare `LEGGIMI.md` (contiene una tua password) né un `sito/config.js` compilato a mano: il repository è pubblico.

---

## 1. Crea il progetto Firebase

1. Vai su **console.firebase.google.com** ed entra con un account Google.
2. **Crea un progetto** → nome `ordini-agrumi` → Google Analytics **disattivato** → Crea.

## 2. Crea il database

1. Nel menu a sinistra: **Build → Firestore Database → Crea database**.
2. Posizione: **europe-west8 (Milano)**, oppure un'altra in Europa.
3. Scegli **Avvia in modalità di produzione** → Crea.

## 3. Attiva l'accesso con email e password

1. **Build → Authentication → Inizia**.
2. In *Metodi di accesso* scegli **Email/password**, attiva solo il primo interruttore e salva.
3. Scheda **Users → Aggiungi utente**: inserisci la tua email e una password. Sono le credenziali con cui entrerai nell'app.

## 4. Collega le pagine a Firebase

1. Tocca l'**ingranaggio → Impostazioni progetto**. In fondo, in *Le tue app*, tocca l'icona **`</>`** (Web).
2. Nome dell'app: `sito`. Non spuntare Firebase Hosting. Premi **Registra app**.
3. Compare un riquadro `const firebaseConfig = { ... }`. Tienilo aperto: ti servono i valori `apiKey`, `authDomain`, `projectId` e `appId` per il punto 5. **Non** scriverli nei file.

Questi valori finiscono comunque nella pagina pubblicata, perché il browser ne ha bisogno: chi li vede non può leggere i dati. I dati li proteggono le regole del punto 7. Le variabili servono a tenere il codice generico, non a nascondere i valori.

## 5. Metti online il sito (GitHub Pages + Actions)

1. Registrati su **github.com**. Il nome utente comparirà nell'indirizzo del sito.
2. In alto a destra **+ → New repository**: nome `ordini-agrumi`, **Public** → Create repository.
3. **Carica i file.** Tocca il link **uploading an existing file**. Dal Finder trascina nella pagina:
   - la **cartella `sito`**;
   - i file `firestore.rules` e `LEGGIMI-FIREBASE.md`.

   Poi premi **Commit changes**.
4. **Crea il file di pubblicazione.** La cartella `.github` è nascosta nel Finder, quindi va creata dal sito:
   - nel repository premi **Add file → Create new file**;
   - come nome scrivi `.github/workflows/pubblica.yml` (le `/` creano le cartelle);
   - apri sul Mac il file `ordini-agrumi/.github/workflows/pubblica.yml` (nel Finder: `Cmd+Shift+.` mostra i file nascosti), copia tutto il contenuto e incollalo;
   - premi **Commit changes**.
5. **Imposta le variabili.** Vai in **Settings → Secrets and variables → Actions → scheda Variables → New repository variable**. Crea una variabile per ogni riga della tabella in alto, con i valori del punto 4.3. Usa **Variables**, non *Secrets*: sono valori pubblici.
6. **Attiva Pages.** Vai in **Settings → Pages** e in *Source* scegli **GitHub Actions**.
7. **Pubblica.** Scheda **Actions → Pubblica il sito → Run workflow**. Dopo 1-2 minuti compare la spunta verde e il sito è su `https://TUONOME.github.io/ordini-agrumi/`.
   - Se manca una variabile, il pallino diventa rosso e il messaggio dice quale.

Da quel momento ogni modifica caricata sul ramo `main` ripubblica il sito da sola. Se cambi una variabile, rilancia **Run workflow**.

**Prova in locale (facoltativo):** copia `sito/config.esempio.js` in `sito/config.js` e compilalo. Il file `.gitignore` impedisce che finisca nel repository se usi git.

## 6. Autorizza l'indirizzo del sito

In Firebase vai in **Authentication → Settings → Domini autorizzati → Aggiungi dominio** e scrivi `TUONOME.github.io`.

## 7. Proteggi il database (regole)

1. Apri l'indirizzo del sito in **Safari** sull'iPhone e accedi con email e password.
2. Compare **Account non abilitato** con un codice: premi **Copia codice**. È l'identificativo del tuo account.
3. In Firebase: **Firestore Database → Regole**. Cancella tutto e incolla il contenuto del file `firestore.rules`, che si trova nella cartella principale, non in `sito`.
4. Sostituisci `INCOLLA-QUI-IL-TUO-UID` con il codice copiato. Restano le virgolette.
5. Premi **Pubblica** e ricarica il sito: entri nell'app.

Con queste regole:
- solo tu leggi e modifichi prodotti, prezzi FdA, membri e prenotazioni;
- i clienti vedono solo le ordinazioni senza i prezzi di Forme dell'Anima;
- i clienti possono solo inviare una prenotazione nuova, e solo finché l'ordinazione è aperta.

## 8. App sulla schermata Home e notifiche

1. In Safari tocca **Condividi → Aggiungi alla schermata Home**. L'app si apre a schermo intero con la sua icona.
2. Installa **ntfy** dall'App Store (gratis).
3. Nell'app degli ordini tocca l'**ingranaggio**. In *Notifiche delle nuove prenotazioni → Notifica push sull'iPhone* premi **Genera → Copia → Salva**.
4. In ntfy tocca **+**, incolla il nome, lascia il server predefinito e conferma. Consenti le notifiche.
5. Torna nelle impostazioni dell'app e premi **Invia prova**: deve arrivare una notifica.

---

## Uso settimanale

1. **Prodotti**: controlla i prezzi al pubblico e i prezzi di Forme dell'Anima.
2. **Nuova ordinazione** (oppure *Duplica* quella della settimana prima): scegli i prodotti, la data di chiusura e la consegna.
3. Scheda **Messaggi → Annuncio per il gruppo → Copia testo**, poi incollalo nel gruppo WhatsApp. Il messaggio contiene il link per prenotare.
4. I clienti aprono il link, scelgono le quantità, scrivono il nome e inviano.
   - Ti arriva la notifica e la prenotazione compare con l'etichetta **Nuova**.
   - Il cliente viene aggiunto da solo ai **Membri**. L'app lo riconosce dal nome, oppure dal telefono se coincide anche il nome di battesimo: due familiari che prenotano dallo stesso telefono restano due membri distinti.
   - Il cliente vede il **link allo stato** della sua prenotazione, con i pulsanti *Copia link* e *Invia su WhatsApp* per salvarlo. Se riapre la pagina dei prodotti dallo stesso telefono, trova "Hai già prenotato: vedi lo stato".
   - Anche il messaggio di riepilogo per il cliente (pulsante *Copia* sulla prenotazione) contiene il link allo stato.
5. Alla scadenza il link smette di accettare prenotazioni da solo. Per mandare le quantità al fornitore usa **Messaggi → Ordine per Forme dell'Anima**.
6. Alla consegna segna *Pagato* e *Consegnato* per ogni cliente, poi premi **Segna consegnata**.

Se un cliente risponde in chat invece di usare il link: **+ Prenotazione → Ha risposto in chat? Incolla il messaggio**.

**Link fisso** (nelle impostazioni): `…/ordina.html` apre sempre l'ordinazione aperta del momento. Puoi metterlo nella descrizione del gruppo.

**Aggiornare il sito** dopo una modifica ai file:
1. Su GitHub apri la cartella `sito` del repository → **Add file → Upload files**.
2. Trascina i file modificati → **Commit changes**.
3. La pubblicazione parte da sola.

## Notifiche al gestore: come aggiungere altri canali

Le notifiche passano dal file `sito/notifiche.js`, che separa due cose:
- **cosa** è successo: l'*evento*, per esempio "nuova prenotazione", con titolo, messaggio e link;
- **come** recapitarlo: i *canali*.

Oggi c'è solo il canale **ntfy** (push sull'iPhone). Per aggiungerne un altro, per esempio l'email, si registra un nuovo canale con `Notifiche.registra({...})`: un esempio commentato è già nel file. Ogni canale indica nome, campi da compilare, controllo dei campi e funzione di invio. La scheda Impostazioni lo mostra da sola, con le caselle per attivarlo e il pulsante di prova.

Ogni canale dichiara anche **da dove parte l'invio**:
- `lato: 'cliente'`: parte dal telefono di chi prenota. La configurazione viene copiata nella pagina pubblica, quindi non deve contenere segreti. È il caso di ntfy.
- `lato: 'server'`: la configurazione contiene chiavi o password e non viene mai pubblicata. L'invio deve farlo un server, per esempio una Cloud Function di Firebase che parte a ogni nuova prenotazione. Serve il piano Blaze, a consumo, che per questi volumi di solito costa 0 €. È il caso di un'email inviata con un servizio come Brevo o SendGrid.

## Limiti da sapere

- **Firebase gratuito** (piano Spark) permette 50.000 letture e 20.000 scritture al giorno: per un gruppo d'acquisto ne basta una piccola parte. A differenza di Supabase, il progetto **non va in pausa** se resta inattivo.
- **La notifica parte dal telefono del cliente** subito dopo l'invio, perché il piano gratuito non ha un server. Se il cliente chiude la pagina all'istante, raramente la notifica può perdersi. La prenotazione invece è sempre salvata e la vedi comunque nell'app.
- **Il link allo stato** permette di vedere quella sola prenotazione (nome, prodotti, nota, telefono) a chi lo possiede. Il codice è casuale e impossibile da indovinare, e nessuno può elencare le prenotazioni degli altri. Se un cliente inoltra il proprio link, chi lo riceve vede la sua prenotazione.
- **Il nome del canale ntfy** è leggibile da chi ispeziona la pagina dei clienti. Per questo le notifiche dicono solo "Nuova prenotazione", con titolo e totale, senza nomi né telefoni.
- **Il repository GitHub è pubblico**: chiunque può vedere il codice delle pagine, ma non i dati, che restano protetti in Firebase.
- **Il link per prenotare è pubblico**: chiunque lo riceva può inviare una prenotazione. Per un gruppo WhatsApp va bene; se ne arrivano di strane, eliminale dall'app.
- **Un cliente non può modificare da solo** una prenotazione già inviata: ti scrive e la modifichi tu.
