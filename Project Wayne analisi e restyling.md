# Project Wayne: analisi e restyling

Oct 22, 2026 · @Nikita

Project Wayne è un diario pubblico di auto-miglioramento ispirato a Bruce Wayne: contenuto forte, ma forma da blog WordPress del 2024, e la nuova versione può trasformare il diario in un'esperienza cinematografica.

**Indice:** 1. Mappa del sito attuale · 2. Diagnosi · 3. Concept della nuova versione · 4. Nuova architettura · 5. Animazioni e interazioni · 6. Stack tecnico e roadmap

## 1. Mappa del sito attuale

Il sito ([projectwayne.com](https://projectwayne.com/)) ha una home e dieci voci di menu, più un menu nascosto dietro "..." che non ho potuto leggere.

| Sezione | Contenuto trovato | Note |
| --- | --- | --- |
| Home | Titolo "Exploring human potential through time management and discipline", sottotitolo "Polymathy inspired by Bruce Wayne", elenco ultimi 5 post, testo manifesto (Batman non ha poteri, solo etica del lavoro), carosello di 10 slide, tabella "Live data" sui pull-up, link social (YouTube, Goodreads, Reddit, Notion, TikTok, GitHub), iscrizione email | Sfondo a fumetto con testo sovrapposto e font monospazio tipo macchina da scrivere |
| Accomplishments | Risultati per anno, dall'anno 1 (nov 2022) all'anno 4 (nov 2025): patente moto, maratona, canale YouTube da 1.000 a 3.900 iscritti, due lauree, licenza immobiliare, corso ufficiali dell'esercito, MMA, taglio da 190 a 160 lb | 14 commenti di incoraggiamento |
| Blueprint | Guida a fasi per diventare un Bruce Wayne reale. Fase 1 Finance (comprarsi il tempo), Fase 2 Global Apprenticeship (studi e mentori nel mondo) | Nota del 7/4/2025: si valuta di fondere fase 1 e 2. Fasi successive non visibili |
| Time Management | Concetto CEO / vigilante, strumenti (Google Calendar, Notion, MyFitnessPal, Clockify, Trello), obiettivi, allenamento con settimane da 80 ore | Elenco di sotto-pagine, parte "Loading..." |
| Notes & Observations | Diario cronologico: anno 1, anno 2 (con tre "Monk Mode"), anno 3, circa 50 voci | Voci iniziali perse nella ricostruzione, restano su r/becomingbatman |
| Projects | 7 progetti con voti: immobiliare, record mondiale di trazioni in 24 ore (100 al giorno), indipendenza finanziaria a 30 anni con 1,25 milioni di dollari, CPA (Certified Public Accountant), laurea in informatica, Project Feynman, un libro al giorno | Ogni progetto ha contatore di voti |
| Forum | Commenti del blog, rimando al subreddit | Di fatto non è un forum |
| Research | Idee da valutare, link a polyphasic.net e Huberman Lab | Quasi vuota |
| Finance | 6 guide: FIRE (Financial Independence Retire Early), conti finanziari, carte di credito, Profit First, finanziare studi, dieta a budget | Card con voti |
| YouTube | Script dei video, 16 voci "Year 3: Week N" | Solo elenco di titoli |
| Archive | Media e ispirazioni (Chael Sonnen, Tim Kennedy, Absolute Batman, Billions, Naval) | Rimanda a Goodreads |

## 2. Diagnosi

Il punto forte è l'idea: un uomo normale che prova a diventare Bruce Wayne, con dati e diario pubblici. Il punto debole è che il sito la racconta come un blog, non come una storia.

**Cosa tenere**

- Il manifesto "Batman non ha poteri, solo lavoro": è il cuore del brand.
- La divisione in anni, fasi e Monk Mode: è già una struttura da campagna a episodi.
- I dati dal vivo (pull-up, allenamenti, finanza): sono la prova che il progetto è reale.
- La doppia identità Bruce e Batman, citata dallo stesso autore come asse del progetto.

**Cosa è datato o debole**

- Leggibilità: testo monospazio con ombra sopra un fumetto in movimento. Un commentatore del forum l'ha segnalato nel 2024 e l'autore ha promesso di sistemarlo.
- Home: elenco di 5 link, testo lungo e una tabella Google Sheets incorporata, bianca e fuori stile.
- Navigazione: 10 voci più un menu "...", senza gerarchia tra le sezioni importanti e quelle quasi vuote.
- Sezioni sottili: Research, Forum e YouTube sono poco più di elenchi. Forum e Notes duplicano il subreddit.
- Nessuna prova sociale ordinata: i risultati (3.900 iscritti, due lauree, MMA) sono in un elenco testuale invece di essere il momento forte.
- Conversione: l'unica azione è l'iscrizione email in fondo a ogni pagina, senza una promessa chiara.
- Mobile e accessibilità: non verificati, ma lo schema a due colonne con carosello sovrapposto fa sospettare problemi.

**Domanda critica per te:** questo restyling è per il sito del proprietario o un tuo progetto portfolio? Cambia tutto: nel secondo caso non serve cambiare i contenuti, nel primo conviene prima proporgli la direzione creativa e solo dopo costruire.

## 3. Concept della nuova versione

Il concept è "Una torre di giorno, una caverna di notte": il sito ha due facce, e il visitatore passa dall'una all'altra come Bruce che scende nella Batcaverna.

Immagina l'ingresso di Wayne Enterprises: marmo, vetro, un'agenda impeccabile. Sotto, nascosta, c'è la sala operativa con mappe, allenamenti e cronologia dei casi. Il sito è l'ascensore tra i due livelli.

**Livello superiore, Wayne Enterprises (Bruce).** Tema chiaro e sobrio, tipografia serif elegante, grigi caldi con un tocco d'oro. Contiene finanza, formazione, carriera, risultati, ovvero la facciata e l'abito (habitus) che l'autore stesso dice di costruire.

**Livello inferiore, Batcaverna (Batman).** Tema scuro, nero e giallo segnale, tipografia condensata da pannello tattico, interfaccia da computer di bordo. Contiene allenamenti, pull-up, diario, Monk Mode e dati dal vivo.

**Meccanismo di passaggio.** Un interruttore "Bruce / Batman" in alto che anima la transizione: la scena si divide come una porta nascosta dietro la libreria, oppure un faro (la Bat-Signal) spazza lo schermo e rivela l'altro tema. Ogni pagina esiste in entrambe le versioni, solo con taglio diverso.

**Regole di stile**

- Palette: nero profondo, grigio antracite, giallo Bat-Signal come unico colore acceso, oro opaco per il livello Bruce.
- Immagini: illustrazioni a tratto e texture di cemento, pioggia e vetro, niente loghi ufficiali o immagini protette del personaggio.
- Voce: frasi brevi, in prima persona, tono da dossier ("Caso n. 41: settimana 41").
- Rischio da evitare: usare simboli ufficiali (pipistrello, logo, personaggi di DC) come asset diretti. Meglio un linguaggio visivo originale che li richiami: ombra, faro, tetti, ingranaggi, orologi.

## 4. Nuova architettura

Le 10 voci diventano 6 destinazioni con nomi tematici, e le sezioni sottili vengono assorbite da quelle forti.

| Nuova sezione | Sostituisce | Funzione | Livello |
| --- | --- | --- | --- |
| Atrio (home) | Home | Manifesto, contatore anni di progetto, risultati chiave, iscrizione | Entrambi |
| Il Curriculum Wayne | Accomplishments | Timeline verticale per anni con traguardi che si accendono allo scorrimento | Bruce |
| Il Piano (Blueprint) | Blueprint, Finance, Research | Fasi come piani di un edificio da percorrere in ascensore, con le guide finanziarie come stanze | Bruce |
| Batcaverna | Time Management, Projects | Dashboard dati dal vivo: pull-up, allenamenti, ore, progetti con barre di avanzamento | Batman |
| Casi (Case Files) | Notes & Observations, YouTube | Diario e script video come fascicoli numerati, filtrabili per anno e Monk Mode | Batman |
| Archivio e Comunità | Archive, Forum | Letture e ispirazioni come scaffali, link a Reddit e commenti | Entrambi |

Il menu in alto si riduce a queste sei voci più l'interruttore Bruce / Batman e il pulsante di iscrizione, quindi niente "..." nascosto.

**Primo schermo dell'Atrio:** titolo "Come diventa Bruce Wayne un uomo normale?", tre numeri animati (anni di progetto, iscritti YouTube, pull-up al giorno) e un pulsante "Entra nel progetto". Sotto, il manifesto spezzato in tre frasi che compaiono una alla volta.

## 5. Animazioni e interazioni

L'animazione deve servire la storia: ogni effetto richiama un gesto di Bruce o di Batman, e nessuno è solo decorazione.

| Momento | Effetto | Riferimento |
| --- | --- | --- |
| Caricamento | Schermo nero, un faro (Bat-Signal) si accende e disegna il titolo con la luce | Il segnale sopra Gotham |
| Interruttore Bruce / Batman | La pagina si apre in due come una porta segreta, oppure la luce sposta l'ombra e inverte i colori | Scendere nella caverna |
| Cursore | Un cono di luce segue il mouse e illumina il testo, il resto resta in penombra | Torcia nel buio |
| Scorrimento della home | Parallasse a strati: skyline di Gotham, pioggia, nebbia a velocità diverse | Tetti di Gotham |
| Curriculum | Linea verticale che si disegna scorrendo, ogni traguardo "si sblocca" con un click metallico visivo | Fascicolo che si compila |
| Il Piano | Ascensore: scorrendo si sale o scende di piano, con indicatore del livello | Torre Wayne |
| Batcaverna, dati | Numeri che salgono come contatori, grafici che si tracciano, pull-up con griglia a punti che si riempie | Computer di bordo |
| Casi | Fascicoli che si impilano come cartelle, con timbro "CASO RISOLTO" al completamento di un Monk Mode | Archivio investigativo |
| Testi | Rivelazione per righe con maschera, testo che appare come battuto a macchina nelle sezioni dossier | Rapporto del detective |
| Iscrizione | Il pulsante "Accendi il segnale" lancia un fascio di luce al clic | Chiamata al vigilante |

**Dettagli di rifinitura:** suono opzionale e disattivato di default (pioggia, passi), modalità "riduci animazioni" che spegne parallasse e luce, e contrasto del testo sempre sopra la soglia di leggibilità, per risolvere il problema segnalato nel forum.

## 6. Stack tecnico e roadmap

Pensa allo stack come a una Batcaverna a tre livelli: sotto il motore dei dati, in mezzo lo scheletro delle pagine, sopra le luci e le ombre che l'utente vede.

| Livello | Scelta | Perché |
| --- | --- | --- |
| Pagine | Next.js o Astro | Velocità e buon posizionamento nei motori di ricerca |
| Animazioni | GSAP con ScrollTrigger, Lenis per lo scorrimento fluido | Controllo preciso della timeline allo scorrimento |
| Scene 3D, luce, pioggia | Three.js o shader leggeri (WebGL), opzionale | Faro e profondità senza video pesanti |
| Dati dal vivo | Google Sheets API o Notion API verso grafici in D3 o Recharts | Sostituisce la tabella bianca incorporata |
| Contenuti | Migrazione dei post WordPress in file Markdown o CMS (Content Management System) leggero | Mantiene diario, script e guide |
| Commenti e newsletter | Servizio esterno già pronto | Evita di ricostruire quello che c'è |

**Roadmap in quattro fasi**

1. Direzione creativa: moodboard, palette, tipografia e storyboard dell'interruttore Bruce / Batman.
2. Prototipo di Atrio e Batcaverna: le due pagine che vendono l'idea, con animazioni principali.
3. Migrazione dei contenuti: Curriculum, Piano, Casi, Archivio con i testi esistenti.
4. Rifinitura: prestazioni, accessibilità, versione mobile, test di leggibilità.

Il primo passo utile è un prototipo cliccabile dell'Atrio con il faro e l'interruttore: è la parte che decide se la direzione piace.

**Fonte:** pagine di [projectwayne.com](https://projectwayne.com/) lette il 22 ottobre 2026; il menu nascosto "..." non è stato letto.
