# Le letture di Yuri

Diario illustrato in italiano, HTML/CSS/JavaScript senza framework, build o dipendenze. I sei libri iniziali e tutte le note sono **esempi**, non letture o recensioni reali di Yuri. Font di sistema, nessuna richiesta a servizi esterni.

## Avvio

Apri questa cartella in VS Code e scegli **Open with Live Server** su `index.html`. In alternativa: `python -m http.server 5500`, poi visita `http://localhost:5500`. Usa un server HTTP: aprire direttamente il file con `file://` può impedire il caricamento del personaggio SVG.

## Aggiungere o spostare un libro

Modifica `data/books.js`, aggiungi un oggetto all’elenco `window.LIBRI` e ricarica il browser:

```js
{
  id: "un-id-univoco",
  titolo: "Titolo del libro",
  autore: "Nome autore",
  stato: "da-leggere",
  nota: "La tua nota personale.",
  esempio: false,
  // Facoltativi:
  anno: 2026,
  valutazione: 4,
  copertina: "assets/covers/mio-libro.jpg"
},
```

Gli stati ammessi sono `in-lettura`, `letto` e `da-leggere`: basta cambiare `stato` per spostare il libro. `valutazione` è un numero da 1 a 5. Ometti i campi facoltativi se non servono. Mantieni `esempio: true` sui contenuti dimostrativi; per i tuoi contenuti usa `false`. Quando rimuovi tutti gli esempi, l’avviso dimostrativo scompare. Conteggi e numeri di catalogo si aggiornano automaticamente; l’ordine segue il file dati. Non c’è salvataggio dal sito.

Inserisci le copertine in `assets/covers/` e usa percorsi relativi alla pagina. Senza immagine (o con un percorso non valido), rimane la copertina tipografica originale: non riproduce l’edizione commerciale del libro.

## Personaggio e schizzi

La foto originale è conservata in `assets/references/omino-libro-originale.jpg`. Aggiungi in quella cartella eventuali nuovi schizzi, senza sovrascrivere l’originale.

`assets/omino-libro.svg` è il disegno vettoriale originale e modificabile derivato dallo schizzo. Viene caricato e inserito nella pagina da `script.js`. I gruppi `corpo`, `pagine`, `occhi`, `sopracciglia`, `baffi`, `braccia`, `gambe` e `bastone` hanno identificatori espliciti. Braccia e gambe hanno ulteriori gruppi sinistro/destro. Le origini di rotazione sono definite in `style.css` nelle coordinate del viewBox 360 × 460. Per sostituire il personaggio mantenendo le animazioni, conserva questi identificatori e aggiorna le origini se cambia la geometria.

La Web Animations API muove il personaggio entro uno spazio riservato in 800 ms, con accelerazione, rallentamento e inclinazione. Le animazioni CSS alternano arti, sobbalzo, pagine e bastone. Un nuovo clic annulla la corsa precedente dalla posizione raggiunta; il cambio di scaffale è immediato. Il percorso si adatta allo spazio disponibile e si riduce su mobile. A riposo: un battito di ciglia ogni 8 secondi e un lieve movimento saltuario delle pagine. `prefers-reduced-motion` disabilita corsa e animazioni decorative.

## Accessibilità e controllo nel browser

I tre scaffali usano il modello tab: frecce destra/sinistra, Home/End oppure clic; Tab prosegue nei contenuti. I dettagli usano un dialog nativo: focus iniziale su Chiudi, navigazione confinata nel dialog, Escape per chiudere e ritorno del focus al libro.

Controlla con Live Server in un browser aggiornato: cambio rapido dei tre scaffali, corsa e leggibilità su desktop/telefono, apertura e chiusura dei dettagli con tastiera, zoom al 200% e preferenza di movimento ridotto. Le API utilizzate (dialog, ResizeObserver e Web Animations) richiedono un browser moderno.