"use strict";

const shelves = ["in-lettura", "letto", "da-leggere"];
const labels = { "in-lettura": "Sto leggendo", letto: "Letti", "da-leggere": "Da leggere" };
const books = Array.isArray(window.LIBRI) ? window.LIBRI : [];
const tabs = [...document.querySelectorAll('[role="tab"]')];
const actor = document.querySelector("#actor");
const character = document.querySelector("#character");
const stage = document.querySelector("#stage");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dialog = document.querySelector("#book-dialog");
const closeDialog = document.querySelector("#close-dialog");
let activeShelf = "in-lettura";
let travel = null;
let lean = null;
let opener = null;

// I testi del file dati vengono inseriti come testo, mai interpretati come HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderBooks() {
  const colors = ["", "cover-blue", "cover-brick", "cover-green", "cover-paper", "cover-blue"];
  const marks = ["✳", "◒", "◈", "❧", "◯", "✦"];
  shelves.forEach((shelf) => {
    const list = document.querySelector(`[data-books="${shelf}"]`);
    const shelfBooks = books.filter((book) => book.stato === shelf);
    document.querySelector(`[data-count="${shelf}"]`).textContent = shelfBooks.length;
    list.replaceChildren();
    if (!shelfBooks.length) list.append(element("p", "empty", "Uno scaffale ancora vuoto. Il prossimo incontro arriverà."));
    shelfBooks.forEach((book) => {
      const index = books.indexOf(book);
      const catalog = String(index + 1).padStart(2, "0");
      const article = element("article", "book-entry");
      const button = element("button", "book-button");
      button.type = "button";
      button.setAttribute("aria-label", `Apri la nota: ${book.titolo}, ${book.autore}`);
      button.setAttribute("aria-haspopup", "dialog");
      const cover = element("span", `cover ${colors[index % colors.length]}`);
      cover.setAttribute("aria-hidden", "true");
      cover.append(element("span", "cover-author", book.autore), element("span", "cover-title", book.titolo), element("span", "cover-mark", marks[index % marks.length]), element("span", "cover-label", `Biblioteca personale / ${catalog}`));
      if (book.copertina) {
        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.addEventListener("error", () => img.remove(), { once: true });
        img.src = book.copertina;
        cover.append(img);
      }
      const copy = element("span", "book-copy");
      const link = element("span", "book-open", "Apri la nota");
      link.append(element("span", "", "↗"));
      copy.append(element("span", "book-catalog", `N. ${catalog}${book.esempio ? " / Esempio" : ""}`), element("span", "book-name", book.titolo), element("span", "book-author", book.autore), element("span", "book-excerpt", book.nota || "Una nota ancora da scrivere."), link);
      button.append(cover, copy);
      button.addEventListener("click", () => openBook(book, catalog, button));
      article.append(button);
      list.append(article);
    });
  });
  const hasExamples = books.some((book) => book.esempio);
  const notice = document.querySelector(".demo-notice");
  notice.hidden = !hasExamples;
  if (hasExamples && books.some((book) => !book.esempio)) {
    notice.textContent = "※ I contenuti contrassegnati come Esempio sono dimostrativi, non letture o recensioni reali di Yuri.";
  }
}

function destination() {
  const distance = Math.max(0, stage.clientWidth - actor.offsetWidth - 12);
  return distance * [0.15, 0.85, 0.48][shelves.indexOf(activeShelf)];
}

function settleCharacter() {
  if (travel) { travel.cancel(); travel = null; }
  if (lean) { lean.cancel(); lean = null; }
  character.classList.remove("is-running");
  actor.style.transform = `translateX(${destination()}px)`;
}

function runCharacter() {
  const currentTransform = getComputedStyle(actor).transform;
  const start = currentTransform === "none" ? 0 : new DOMMatrixReadOnly(currentTransform).m41;
  const end = destination();
  // Cancella la corsa precedente conservando la posizione visibile: nessuna coda.
  if (travel) travel.cancel();
  if (lean) lean.cancel();
  actor.style.transform = `translateX(${end}px)`;
  if (reducedMotion.matches || !character.querySelector("svg") || Math.abs(end - start) < 2) {
    settleCharacter();
    return;
  }
  const direction = end > start ? 1 : -1;
  character.classList.add("is-running");
  lean = character.animate([
    { transform: "rotate(0deg)" },
    { transform: `rotate(${direction * 6}deg)`, offset: 0.16 },
    { transform: `rotate(${direction * 6}deg)`, offset: 0.7 },
    { transform: "rotate(0deg)" }
  ], { duration: 800, easing: "ease-in-out" });
  const animation = actor.animate([
    { transform: `translateX(${start}px)` },
    { transform: `translateX(${end}px)` }
  ], { duration: 800, easing: "cubic-bezier(.4,0,.2,1)" });
  travel = animation;
  animation.onfinish = () => {
    if (travel !== animation) return;
    travel = null;
    lean = null;
    character.classList.remove("is-running");
  };
}

function selectShelf(shelf) {
  if (shelf === activeShelf) return;
  activeShelf = shelf;
  document.querySelector("#scene-destination").textContent = `${String(shelves.indexOf(shelf) + 1).padStart(2, "0")} / ${labels[shelf]}`;
  tabs.forEach((tab) => {
    const selected = tab.dataset.shelf === shelf;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
  });
  const count = books.filter((book) => book.stato === shelf).length;
  document.querySelector("#shelf-status").textContent = `${labels[shelf]}: ${count} ${count === 1 ? "libro" : "libri"}.`;
  runCharacter();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectShelf(tab.dataset.shelf));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    selectShelf(tabs[next].dataset.shelf);
  });
});

function openBook(book, catalog, button) {
  opener = button;
  document.querySelector("#detail-index").textContent = `N. ${catalog} / ${labels[book.stato]}`;
  document.querySelector("#detail-title").textContent = book.titolo;
  document.querySelector("#detail-author").textContent = book.autore;
  document.querySelector("#detail-note").textContent = book.nota || "Una nota ancora da scrivere.";
  const meta = [];
  if (book.anno) meta.push(`Anno di lettura: ${book.anno}`);
  if (Number.isFinite(book.valutazione)) meta.push(`Valutazione: ${book.valutazione}/5`);
  document.querySelector("#detail-meta").textContent = meta.join(" · ");
  document.querySelector("#detail-demo").hidden = !book.esempio;
  dialog.showModal(); // Il dialog nativo confina il focus e gestisce Escape.
  document.body.classList.add("modal-open");
  closeDialog.focus();
}
closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if (opener?.isConnected) opener.focus();
});

async function loadCharacter() {
  try {
    const response = await fetch("assets/omino-libro.svg");
    if (!response.ok) throw new Error(`SVG: ${response.status}`);
    const source = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
    if (source.querySelector("parsererror") || source.documentElement.localName !== "svg") throw new Error("SVG non valido");
    character.append(document.importNode(source.documentElement, true));
    settleCharacter();
  } catch (error) {
    document.querySelector(".theatre figcaption").append(element("span", "illustration-status", " Illustrazione non disponibile. Avvia la pagina con Live Server."));
    console.error("Impossibile caricare il personaggio:", error);
  }
}
renderBooks();
settleCharacter();
loadCharacter();
new ResizeObserver(settleCharacter).observe(stage);
reducedMotion.addEventListener("change", settleCharacter);