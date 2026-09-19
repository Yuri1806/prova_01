# Le letture di Yuri

Diario personale in HTML, CSS e JavaScript, senza framework, build o backend. Tre scaffali sempre visibili su desktop, impilati su mobile. Tutte le risorse sono locali: il sito non contatta Goodreads o altri servizi.

## Avvio

Apri `index.html` con **Open with Live Server** in VS Code. In alternativa esegui `python -m http.server 5500` dalla cartella del progetto e visita `http://localhost:5500`. Serve HTTP per caricare il personaggio SVG; evita l'apertura diretta con `file://`.

## Aggiornare le letture

Modifica l'array `window.LIBRI` in **`data/books.js`** e ricarica la pagina. Ogni record ha un `id` univoco e stabile: conservalo quando modifichi il libro. Per aggiungere una lettura, copia un record, assegna un nuovo id (per esempio `libro-mio-123`) e compila:

```js
{
  "id": "libro-mio-123",
  "titolo": "Titolo",
  "autore": "Autore",
  "stato": "da-leggere",
  "voto_personale": null,
  "date_lettura": [],
  "data_aggiunta": null,
  "note_personali": null
}
```

Stati ammessi: `in-lettura`, `letto`, `da-leggere`. Cambiare `stato` sposta il libro. `voto_personale` contiene un numero intero da 1 a 5 oppure `null`; le date sono stringhe `AAAA-MM-GG`. `date_lettura` può contenere più date esplicite. **La data di aggiunta non è la data di lettura.** Per informazioni sconosciute usa `null` o `[]`, non zero. Puoi aggiungere le tue note in `note_personali`.

L'ordine nel file è mantenuto all'interno di ogni scaffale; non viene dedotta una cronologia. Il totale e i conteggi sono automatici. Tutti i libri in lettura sono mostrati subito; gli altri scaffali partono da cinque e ne aggiungono dieci con “Mostra altri”. Il dettaglio mostra soltanto i campi disponibili.

## Fonte e anomalie conservate

I 122 record provengono dall'array JSON in `assets/references/letture_yuri_reference.txt`: **2 in lettura, 90 letti, 30 da leggere**. Il riferimento originale è conservato, insieme a denominazioni, ordine, voti personali e date. Non sono state importate medie Goodreads né inventate note, recensioni o copertine.

La fonte contiene queste precisazioni:

- Il testo di origine mostra le pagine 1 e 2: non è verificata la completezza dell'intera libreria Goodreads.
- **TUTTE LE FAVOLE DI FEDRO** è attribuito a **ZIRNA, MARIA**. Titolo completo e attribuzione sono conservati e restano da verificare.
- Per **Il dottor Živago**, il TXT conserva la sola data di lettura esplicita **12 gennaio 2025**; una seconda voce non impostata era già stata esclusa dall'elaborazione della fonte.

## Grafica e font

`homepage-finale.png` guida l'impaginazione; `libro-baffi-v4.png` guida il personaggio. La palette CSS è `#FAF9F6`, `#191919`, `#D93632`, `#D8CEE8`. Le immagini di riferimento non sono usate come sfondi o pagine raster.

La testata e le intestazioni usano **Roboto Serif Black Ultra Condensed**, un disegno realmente condensato (asse `wdth` 50, peso 900, dimensione ottica 8), distribuito localmente in `assets/fonts/RobotoSerif-BlackCondensed.ttf`. Non viene applicato `scaleX` alle lettere. L'istanza proviene da Google Fonts; licenza **SIL Open Font License 1.1**, inclusa in `assets/fonts/RobotoSerif-OFL.txt`. La licenza permette incorporamento e redistribuzione accompagnati dalla licenza. Fonte ufficiale: [Google Fonts, Roboto Serif](https://github.com/google/fonts/tree/main/ofl/robotoserif). Fallback display: Georgia/serif.

Il catalogo usa **Arial**, font di sistema non ridistribuito dal progetto, con fallback Helvetica/sans-serif. Sono quindi richieste solo due famiglie principali e nessun servizio font esterno.

## Personaggio e movimento

Il disegno modificabile è **`assets/omino-libro.svg`**, ricostruito in vettoriale dal riferimento definitivo. I gruppi sono `corpo`, `pagine`, `occhiali`, `baffi`, `cravatta`, `braccia`, `gambe`, `bastone`, con ulteriori articolazioni per arti e ginocchia. Le lenti sono vuote: non ci sono occhi o altri tratti facciali oltre ai baffi. Tutti i riferimenti, inclusa la prima foto originale, sono conservati in `assets/references/`.

Per un nuovo disegno sostituisci l'SVG mantenendo gli identificatori oppure aggiorna le selezioni e le origini di rotazione in **`character.css`** (coordinate del viewBox 240 × 320). Aggiungi nuovi riferimenti nella cartella dedicata senza cancellare gli originali.

**`character.js`** gestisce soltanto il personaggio; **`script.js`** gestisce i libri e invia l'evento `shelf:activate`. Le destinazioni dipendono dai rettangoli reali delle colonne, o dai tre pulsanti su mobile. I limiti tengono conto della scenografia e della sagoma articolata. Il contenitore si sposta con Web Animations API; CSS anima gambe, ginocchia, braccia, pagine e cravatta. Il personaggio si gira quando torna a sinistra. La durata varia con la distanza (500–1200 ms), con un breve assestamento finale. I clic rapidi annullano il movimento precedente dalla posizione corrente. Resize e preferenza di movimento ridotto ricalcolano la destinazione; non ci sono animazioni a riposo né corse all'hover.

Su mobile i pulsanti avviano subito lo scorrimento alla sezione, senza aspettare il personaggio. `prefers-reduced-motion` elimina corsa, sobbalzo e scorrimento animato. Il dettaglio usa un dialog nativo con focus iniziale su Chiudi, Escape e ritorno al libro; “Mostra altri” porta il focus al primo nuovo libro.
## Verifiche eseguite

Test automatici in Chrome su Live Server: confronto integrale dei 122 record con la fonte, conteggi, paginazione completa, apertura di tutti i dettagli, tastiera, focus, Escape, movimento ridotto, ingresso e corsa prima-terza in entrambe le direzioni, clic rapidi e resize durante la corsa. Controllati tutti i titoli a otto larghezze tra 320 e 1350 px; campionata anche la sagoma durante il movimento per escludere tagli e sovrapposizioni con la libreria. Nessun errore JavaScript nei test.

Le viste desktop e mobile sono state osservate e confrontate con il mockup. I quattro riferimenti originali sono stati verificati tramite SHA-256 e risultano invariati. Non testati: Safari, Firefox, dispositivi fisici e lettori di schermo.
