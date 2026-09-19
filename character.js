"use strict";

// Motore della sola illustrazione: non legge né modifica i dati dei libri.
(() => {
  const stage = document.querySelector("#stage");
  const actor = document.querySelector("#actor");
  const facing = document.querySelector("#actor-facing");
  const character = document.querySelector("#character");
  const mobile = matchMedia("(max-width: 860px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let target = "in-lettura";
  let ready = false;
  let travel = null;
  let posture = null;
  let entrance = null;
  let resizeFrame = 0;

  function currentX() {
    const transform = getComputedStyle(actor).transform;
    return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
  }

  function bounds() {
    const scene = stage.getBoundingClientRect();
    const width = actor.offsetWidth;
    // Margine per bastone, scarpe e articolazioni oltre il viewBox durante la corsa.
    const guard = width * .2;
    let left = guard;
    let right = scene.width - width - guard;
    for (const [selector, side] of [[".book-stack", "left"], [".bookcase", "right"]]) {
      const object = stage.querySelector(selector);
      if (getComputedStyle(object).display === "none") continue;
      const rect = object.getBoundingClientRect();
      if (side === "left") left = Math.max(left, rect.right - scene.left + guard);
      else right = Math.min(right, rect.left - scene.left - width - guard);
    }
    return { left, right: Math.max(left, right) };
  }

  function destination(state) {
    const anchor = mobile.matches
      ? document.querySelector(`.mobile-nav [data-destination="${state}"]`)
      : document.querySelector(`#scaffale-${state}`);
    const rect = anchor.getBoundingClientRect();
    const scene = stage.getBoundingClientRect();
    const ideal = rect.left + rect.width / 2 - scene.left - actor.offsetWidth / 2;
    const limits = bounds();
    return Math.max(limits.left, Math.min(limits.right, ideal));
  }

  function cancelMotion() {
    if (travel) { travel.cancel(); travel = null; }
    if (posture) { posture.cancel(); posture = null; }
    if (entrance) { entrance.cancel(); entrance = null; }
    character.classList.remove("is-running");
  }

  function placeImmediately() {
    if (!ready) return;
    cancelMotion();
    actor.style.transform = `translateX(${destination(target)}px)`;
    actor.dataset.target = target;
  }

  function moveTo(state, entering = false) {
    target = state;
    if (!ready) return;
    const start = currentX();
    const end = destination(state);
    cancelMotion();
    actor.dataset.target = state;
    actor.style.transform = `translateX(${end}px)`;
    const distance = Math.abs(end - start);
    if (reducedMotion.matches || distance < 1) return;
    facing.classList.toggle("facing-left", end < start);
    // Una corsa intera dura 500–1200 ms, inclusi 140 ms di assestamento.
    const duration = Math.min(1200, Math.max(500, 480 + distance * .85));
    const runningTime = duration - 140;
    actor.dataset.duration = String(Math.round(duration));
    character.classList.add("is-running");
    posture = character.animate([
      { transform: "rotate(0deg)" },
      { transform: "rotate(7deg)", offset: .16 },
      { transform: "rotate(7deg)", offset: .8 },
      { transform: "rotate(4deg)" }
    ], { duration: runningTime, easing: "ease-in-out", fill: "forwards" });
    if (entering) {
      entrance = actor.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
    }
    const animation = actor.animate([
      { transform: `translateX(${start}px)` },
      { transform: `translateX(${end}px)` }
    ], { duration: runningTime, easing: "cubic-bezier(.35,0,.25,1)" });
    travel = animation;
    animation.onfinish = () => {
      if (travel !== animation) return;
      travel = null;
      character.classList.remove("is-running");
      posture?.cancel();
      const settling = character.animate([
        { transform: "rotate(4deg) translateY(0)" },
        { transform: "rotate(-1deg) translateY(1px)", offset: .55 },
        { transform: "rotate(0deg) translateY(0)" }
      ], { duration: 140, easing: "ease-out" });
      posture = settling;
      settling.onfinish = () => { if (posture === settling) posture = null; };
      entrance = null;
    };
  }

  document.addEventListener("shelf:activate", event => {
    if (!["in-lettura", "letto", "da-leggere"].includes(event.detail?.state)) return;
    // Legge la posizione renderizzata prima di cancellare l'animazione precedente.
    moveTo(event.detail.state);
  });

  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(placeImmediately);
  });
  observer.observe(stage);
  reducedMotion.addEventListener("change", placeImmediately);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) placeImmediately();
  });

  async function load() {
    try {
      const response = await fetch("assets/omino-libro.svg");
      if (!response.ok) throw new Error(`SVG: ${response.status}`);
      const xml = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
      if (xml.querySelector("parsererror") || xml.documentElement.localName !== "svg") throw new Error("SVG non valido");
      character.append(document.importNode(xml.documentElement, true));
      await document.fonts.ready;
      ready = true;
      actor.classList.add("ready");
      // Entra dal margine sinistro libero, dopo la piccola pila di libri.
      actor.style.transform = `translateX(${bounds().left}px)`;
      moveTo(target, true);
    } catch (error) {
      // Il catalogo resta interamente utilizzabile se manca l'illustrazione.
      console.warn("Personaggio non disponibile:", error);
    }
  }
  load();
})();