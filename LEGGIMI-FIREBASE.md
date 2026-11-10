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
| `ACCESSO_GESTORE` | accessi esterni del gestore, separati da virgola: `apple`, `google` (vedi "Accesso con Apple") | no: senza, solo email e password |

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

1. Apri il sito e accedi, con email e password oppure con Apple.
2. Compare **Account non abilitato** con un codice: premi **Copia codice**. È l'identificativo (UID) del tuo account.
3. Metti l'UID nelle regole e pubblicale, in uno dei due modi:
   - **Con lo script**: scrivi l'UID in un file `.gestori` nella cartella principale, uno per riga. Il file resta sul tuo Mac ed è escluso da git. Poi lancia `./pubblica-regole.sh ID-PROGETTO`.
   - **A mano**: in Firebase apri **Firestore Database → Regole** e incolla il contenuto di `firestore.rules`. Sostituisci `INCOLLA-QUI-IL-TUO-UID` con l'UID, lasciando le virgolette, e premi **Pubblica**.
4. Ricarica il sito: entri nell'app.

Ogni modo di accesso ha un suo UID: se entri sia con email sia con Apple, metti nell'elenco entrambi gli UID, separati da virgola nelle regole oppure su righe diverse in `.gestori`. Lo stesso vale per un secondo gestore.

Con queste regole:
- solo tu leggi e modifichi prodotti, prezzi FdA, membri e prenotazioni;
- i clienti vedono solo le ordinazioni senza i prezzi di Forme dell'Anima;
- i clienti possono solo inviare una prenotazione nuova, e solo finché l'ordinazione è aperta.

## 8. Installa l'app e attiva le notifiche

L'app del gestore si installa come una vera app, con la sua icona, e si apre in una finestra a parte. Le istruzioni per il dispositivo che stai usando sono anche nella schermata di accesso (*Installa come app…*) e in **Impostazioni → Installa l'app**.

| Dispositivo | Come si installa |
|---|---|
| **iPhone / iPad** | In **Safari**: **Condividi → Aggiungi alla schermata Home → Aggiungi** |
| **Android** | In Chrome compare **Installa l'app**, oppure menu ⋮ → **Installa app** |
| **Computer Windows / Mac** con Chrome o Edge | Icona **Installa** nella barra degli indirizzi, oppure il pulsante *Installa l'app* nelle Impostazioni |
| **Mac con Safari** | Menu **File → Aggiungi al Dock** |

L'app installata ha un accesso separato da quello del browser: la prima volta accedi di nuovo. Con rete scarsa si apre lo stesso, mentre i dati arrivano sempre in tempo reale da Firebase.

Per le notifiche:

1. Installa l'app sull'iPhone come indicato sopra.
2. Installa **ntfy** dall'App Store (gratis).
3. Nell'app degli ordini tocca l'**ingranaggio**. In *Notifiche delle nuove prenotazioni → Notifica push sull'iPhone* premi **Genera → Copia → Salva**.
4. In ntfy tocca **+**, incolla il nome, lascia il server predefinito e conferma. Consenti le notifiche.
5. Torna nelle impostazioni dell'app e premi **Invia prova**: deve arrivare una notifica.

---

## Uso settimanale

1. **Prodotti**: controlla i prezzi al pubblico e i prezzi di Forme dell'Anima.
2. **Nuova ordinazione** (oppure *Duplica* quella della settimana prima): scegli i prodotti, la data di chiusura e la consegna. L'ordinazione nasce come **Bozza**: i clienti non la vedono.
3. Premi **Anteprima**: vedi la vera pagina dei clienti con i dati della bozza. Puoi provare a scegliere i prodotti, ma l'invio è disattivato. Se è tutto giusto premi **Pubblica**: l'app controlla che ci siano prodotti, prezzi e una data di chiusura futura.
4. Scheda **Messaggi → Annuncio per il gruppo → Copia testo**, poi incollalo nel gruppo WhatsApp. Il messaggio contiene il link per prenotare.
5. I clienti aprono il link, scelgono le quantità, scrivono il nome e inviano.
   - Ti arriva la notifica e la prenotazione compare con l'etichetta **Nuova**.
   - Il cliente viene aggiunto da solo ai **Clienti**. L'app lo riconosce dal nome, oppure dal telefono se coincide anche il nome di battesimo: due familiari che prenotano dallo stesso telefono restano due membri distinti.
   - Il cliente vede il **link allo stato** della sua prenotazione, con i pulsanti *Copia link* e *Invia su WhatsApp* per salvarlo. Se riapre la pagina dei prodotti dallo stesso telefono, trova "Hai già prenotato: vedi lo stato".
   - Anche il messaggio di riepilogo per il cliente (pulsante *Copia* sulla prenotazione) contiene il link allo stato.
6. Alla scadenza il link smette di accettare prenotazioni da solo. Per mandare le quantità al fornitore usa **Messaggi → Ordine per Forme dell'Anima**.
7. Alla consegna segna *Pagato* e *Consegnato* per ogni cliente, poi premi **Segna consegnata**.

Se un cliente risponde in chat invece di usare il link: **+ Prenotazione → Ha risposto in chat? Incolla il messaggio**.

I clienti devono indicare **nome e telefono**: senza un numero valido la prenotazione non parte.

### Riepilogo prodotti

Nella scheda di ogni ordinazione, la sezione **Riepilogo prodotti** mostra per ogni prodotto quante prenotazioni lo contengono e la quantità totale prenotata, divisa tra clienti e autoconsumo quando c'è. In fondo elenca i prodotti offerti ma non prenotati. *Copia* prepara il testo da incollare in WhatsApp; *Excel* scarica il foglio dell'ordinazione.

### Autoconsumo e spese di spedizione

- **Autoconsumo**: nella scheda di un'ordinazione premi *Autoconsumo* e inserisci gli agrumi che Forme dell'Anima tiene per sé. Entrano nell'ordine al fornitore e nella lista consegne, ma si contano a **prezzo d'acquisto**: non generano ricavo e il loro costo riduce il guadagno. C'è una sola voce di autoconsumo per ordinazione: premendo di nuovo il pulsante la modifichi. Non compare tra i clienti né nelle loro statistiche.
- **Spedizione**: premi *Spedizione*, oppure compila il campo nel modulo dell'ordinazione, e inserisci l'importo. Si può cambiare in qualsiasi momento, anche dopo la consegna. I clienti non lo vedono.
- **Guadagno netto** = ricavi − costo di tutti i prodotti (autoconsumo compreso) − spese di spedizione. È il valore mostrato in dashboard, nelle schede e nei fogli Excel.

### Fogli di calcolo (Excel)

| Dove | Pulsante | Contenuto |
|---|---|---|
| Scheda di un'ordinazione | **Excel** | Riepilogo prodotti (quantità prenotate per prodotto), riepilogo con i conti (autoconsumo, spedizione, guadagno netto), Prenotazioni (una colonna per prodotto), Ordine per Forme dell'Anima, Autoconsumo |
| Dashboard | **Excel** | Storico prodotti (una colonna per ordinazione, con totali e media), prodotti per ordinazione riga per riga, tutte le ordinazioni con i totali, tutte le prenotazioni, prodotti (venduti e in autoconsumo), autoconsumo (dettaglio e totali per prodotto), anagrafe clienti |
| Clienti | **Excel** | Anagrafe con spesa, pagamenti e prodotto preferito |
| Scheda cliente | **Excel** | Resoconto personale, storico, dettaglio prodotti, prodotti preferiti |

Sul telefono il file si apre nel menu Condividi (*Salva su File*, WhatsApp, Mail…); sul computer viene scaricato.

### Clienti e analisi

- **Clienti** (prima "Membri") è l'anagrafe: ricerca per nome o telefono, ordinamento per nome, spesa, debito o data, e totali in alto.
- Toccando un cliente si apre la sua **scheda**: chiamata e WhatsApp diretti, totale speso, pagato e da pagare, prodotti preferiti, storico.
- Nella scheda c'è anche il **resoconto personale**, da inviare con *Invia su WhatsApp* o scaricare in Excel.
- La **Dashboard** mostra anche clienti migliori, clienti attivi, nuovi e ricorrenti, spesa media, ricavi per categoria e l'elenco di chi deve ancora pagare.

### Gesture sullo smartphone

| Gesto | Effetto |
|---|---|
| Scorri a sinistra / destra | Sezione successiva o precedente (Dashboard → Ordinazioni → Prodotti → Clienti); dentro un'ordinazione cambia scheda |
| Scorri dal bordo sinistro (app installata) | Torna indietro |
| Scorri una prenotazione verso destra | Pagato / da pagare |
| Scorri una prenotazione verso sinistra | Consegnato / non consegnato |
| Trascina in giù la parte alta di una finestra | La chiude |

**Link fisso** (nelle impostazioni): `…/ordina.html` apre sempre l'ordinazione aperta del momento. Puoi metterlo nella descrizione del gruppo.

**Aggiornare il sito** dopo una modifica ai file:
1. Su GitHub apri la cartella `sito` del repository → **Add file → Upload files**.
2. Trascina i file modificati → **Commit changes**.
3. La pubblicazione parte da sola.

## Accesso con Apple

Il pulsante **Accedi con Apple** compare quando la variabile GitHub `ACCESSO_GESTORE` contiene `apple`. Perché funzioni, Apple chiede una configurazione che si può fare solo con un account dell'**Apple Developer Program** (99 $ l'anno):

1. Su **developer.apple.com → Certificates, IDs & Profiles**:
   - crea un **Services ID** (per esempio `it.formedellanima.ordini.web`) e attiva *Sign in with Apple*;
   - come dominio indica `PROGETTO.firebaseapp.com` e come Return URL `https://PROGETTO.firebaseapp.com/__/auth/handler`;
   - in **Keys** crea una chiave con *Sign in with Apple* e scarica il file `.p8`.
2. In Firebase vai in **Authentication → Metodi di accesso → Apple → Attiva** e inserisci:
   - il Services ID;
   - il Team ID di Apple;
   - il Key ID;
   - il contenuto del file `.p8`.
3. Accedi con Apple e aggiungi il nuovo UID alle regole (punto 7).

Finché la configurazione non è fatta, il pulsante mostra "L'accesso con Apple non è ancora attivo in Firebase".

**Limiti noti:**
- Nel **browser** (Safari, Chrome, sul telefono o sul computer) l'accesso con Apple funziona con una piccola finestra.
- Nell'**app installata su iPhone** quella finestra non è disponibile e si passa per un reindirizzamento. Safari può bloccarlo, perché il sito (`github.io`) e il servizio di accesso (`firebaseapp.com`) hanno indirizzi diversi. In quel caso l'app lo spiega: accedi con email e password. L'accesso resta memorizzato, quindi si fa di rado.
- Se ospitassi il sito su **Firebase Hosting** (gratuito) invece che su GitHub Pages, i due indirizzi coinciderebbero e il problema sparirebbe.

Con la stessa variabile si può attivare anche `google` (Accedi con Google). È gratuito e in Firebase basta attivarlo in *Metodi di accesso*.

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
