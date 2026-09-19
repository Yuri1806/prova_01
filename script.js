"use strict";

// Catalogo e dettagli. Il personaggio ascolta l'evento shelf:activate in character.js.
(() => {
  const states = ["in-lettura", "letto", "da-leggere"];
  const labels = { "in-lettura": "Sto leggendo", letto: "Letti", "da-leggere": "Da leggere" };
  const books = Array.isArray(window.LIBRI) ? window.LIBRI : [];
  const dialog = document.querySelector("#book-dialog");
  const closeButton = document.querySelector("#close-dialog");
  const mobile = matchMedia("(max-width: 860px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const views = new Map();
  let opener = null;

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function formatDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T12:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
    return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }

  function addField(label, value) {
    if (!value) return;
    const field = node("div", "detail-field");
    field.append(node("dt", "", label), node("dd", "", value));
    document.querySelector("#detail-metadata").append(field);
  }

  function openBook(book, button) {
    opener = button;
    document.querySelector("#detail-title").textContent = book.titolo;
    document.querySelector("#detail-author").textContent = book.autore;
    document.querySelector("#detail-metadata").replaceChildren();
    addField("Scaffale", labels[book.stato]);
    if (Number.isInteger(book.voto_personale) && book.voto_personale >= 1 && book.voto_personale <= 5) {
      addField("Voto personale", `${book.voto_personale} su 5`);
    }
    const dates = Array.isArray(book.date_lettura) ? book.date_lettura.map(formatDate).filter(Boolean) : [];
    addField(dates.length > 1 ? "Date di lettura" : "Data di lettura", dates.join(" · "));
    addField("Data di aggiunta", formatDate(book.data_aggiunta));
    const notes = typeof book.note_personali === "string" ? book.note_personali.trim() : "";
    document.querySelector("#detail-notes").hidden = !notes;
    document.querySelector("#detail-notes p").textContent = notes;
    dialog.showModal();
    document.body.classList.add("modal-open");
    closeButton.focus();
  }

  function bookItem(book) {
    const li = node("li", "book-entry");
    const button = node("button", "book-button");
    button.type = "button";
    button.dataset.bookId = book.id;
    button.setAttribute("aria-haspopup", "dialog");
    button.append(node("span", "book-title", book.titolo), node("span", "book-author", book.autore));
    button.addEventListener("click", () => openBook(book, button));
    li.append(button);
    return li;
  }

  function appendBooks(state, limit) {
    const view = views.get(state);
    const previous = view.visible;
    const next = Math.min(limit, view.books.length);
    const fragment = document.createDocumentFragment();
    view.books.slice(previous, next).forEach(book => fragment.append(bookItem(book)));
    view.list.append(fragment);
    view.visible = next;
    document.querySelector(`[data-visible-count="${state}"]`).textContent = `${next} / ${view.books.length} libri`;
    const more = document.querySelector(`[data-more="${state}"]`);
    if (more) {
      more.hidden = next >= view.books.length;
      more.setAttribute("aria-label", `Mostra altri ${Math.min(10, view.books.length - next)} libri: ${labels[state]}`);
    }
    return view.list.querySelectorAll(".book-button")[previous];
  }

  document.querySelector("#total-books").textContent = books.length;
  states.forEach(state => {
    const shelfBooks = books.filter(book => book.stato === state);
    const list = document.querySelector(`#books-${state}`);
    views.set(state, { books: shelfBooks, visible: 0, list });
    document.querySelector(`[data-count="${state}"]`).textContent = String(shelfBooks.length).padStart(2, "0");
    appendBooks(state, state === "in-lettura" ? shelfBooks.length : 5);
    if (!shelfBooks.length) list.append(node("li", "empty", "Nessun libro in questo scaffale."));
  });

  document.querySelectorAll("[data-more]").forEach(button => {
    button.addEventListener("click", () => {
      const state = button.dataset.more;
      const firstAdded = appendBooks(state, views.get(state).visible + 10);
      // Il focus prosegue dal primo libro appena aggiunto, anche quando il pulsante scompare.
      firstAdded?.focus();
    });
  });

  document.querySelectorAll("[data-destination]").forEach(button => {
    button.addEventListener("click", () => {
      const state = button.dataset.destination;
      document.querySelectorAll("[data-destination]").forEach(control => {
        control.setAttribute("aria-pressed", String(control.dataset.destination === state));
      });
      document.dispatchEvent(new CustomEvent("shelf:activate", { detail: { state } }));
      document.querySelector("#navigation-status").textContent = `Scaffale ${labels[state]}, ${views.get(state).books.length} libri.`;
      if (mobile.matches) {
        const section = document.querySelector(`#scaffale-${state}`);
        if (button.closest(".mobile-nav")) section.querySelector(".shelf-control").focus({ preventScroll: true });
        // Lo scorrimento parte subito, indipendentemente dalla durata della corsa.
        section.scrollIntoView({ block: "start", behavior: reducedMotion.matches ? "instant" : "smooth" });
      }
    });
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
})();