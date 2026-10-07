import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo, useRef, useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { m as memberProgress } from "./people-tower-motion-4WityqE6.js";
import { v as variants, s as sortTeamMembers } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "styled-components";
import "react-router-dom";
import "framer-motion";
import "react-dom";
import "clsx";
import "tailwind-merge";
import "@studio-freight/lenis";
import "gsap";
function createTowerPortraits(members, small) {
  const cache = /* @__PURE__ */ new Map();
  const pending = /* @__PURE__ */ new Set();
  let wanted = [], disposed = false, active = -1;
  let host;
  function request(source) {
    const image = new Image();
    image.className = "tower-profile__photo";
    image.alt = "";
    image.loading = "eager";
    image.decoding = "async";
    return { image, source, loaded: false, started: false, cancelled: false };
  }
  function cancel(item) {
    item.cancelled = true;
    item.image.removeAttribute("src");
    pending.delete(item);
  }
  function attach(index, portrait) {
    if (disposed || active !== index || cache.get(index) !== portrait || !host) return;
    const ready = portrait.full?.loaded ? portrait.full : portrait.thumbnail.loaded ? portrait.thumbnail : void 0;
    if (!ready || host.querySelector(".tower-profile__photo") === ready.image) return;
    host.dataset.hasPhoto = "true";
    host.querySelectorAll(".tower-profile__photo").forEach((el) => el.remove());
    host.insertBefore(ready.image, host.querySelector(".tower-profile__photo-fade"));
  }
  function start(index, portrait, item) {
    item.started = true;
    pending.add(item);
    const image = item.image;
    image.fetchPriority = index === wanted[0] ? "high" : "low";
    image.src = item.source;
    void image.decode().then(() => {
      if (item.cancelled || disposed || cache.get(index) !== portrait) return;
      item.loaded = true;
      attach(index, portrait);
    }).catch(() => {
    }).finally(() => {
      pending.delete(item);
      if (disposed || cache.get(index) !== portrait) image.removeAttribute("src");
      pump();
    });
  }
  function pump() {
    if (disposed) return;
    for (const index of wanted) {
      const portrait2 = cache.get(index);
      if (!portrait2 || portrait2.thumbnail.started) continue;
      if (pending.size >= 2) break;
      start(index, portrait2, portrait2.thumbnail);
    }
    const portrait = cache.get(active);
    if (pending.size < 2 && portrait?.thumbnail.loaded && portrait.full && !portrait.full.started) start(active, portrait, portrait.full);
  }
  function prepare(index) {
    if (disposed) return;
    const next = [index, index + 1, index + 2, index + 3, index - 1, index - 2].filter((value) => value >= 0 && value < members.length);
    if (next.length === wanted.length && next.every((value, i) => value === wanted[i])) return;
    wanted = next;
    for (const [key, portrait] of cache) {
      if (wanted.includes(key)) {
        portrait.thumbnail.image.fetchPriority = key === index ? "high" : "low";
        if (key !== index && portrait.full && pending.has(portrait.full)) {
          const source = portrait.full.source;
          cancel(portrait.full);
          portrait.full = request(source);
        }
        continue;
      }
      cancel(portrait.thumbnail);
      if (portrait.full) cancel(portrait.full);
      cache.delete(key);
    }
    for (const key of wanted) {
      const source = members[key].image;
      if (!source || cache.has(key)) continue;
      const bundled = variants[source];
      const thumbnail = request(bundled?.small ?? source);
      const full = !small && bundled && bundled.large !== bundled.small ? request(bundled.large) : void 0;
      cache.set(key, { thumbnail, full, preview: bundled?.preview });
    }
    pump();
  }
  function show(index, element) {
    active = index;
    host = element;
    delete host.dataset.hasPhoto;
    host.querySelectorAll(".tower-profile__photo").forEach((el) => el.remove());
    prepare(index);
    const portrait = cache.get(index);
    if (portrait?.preview) {
      host.dataset.hasPhoto = "true";
      const preview = new Image();
      preview.className = "tower-profile__photo";
      preview.alt = "";
      preview.dataset.preview = "true";
      preview.src = portrait.preview;
      host.insertBefore(preview, host.querySelector(".tower-profile__photo-fade"));
    }
    if (portrait) attach(index, portrait);
    pump();
  }
  function dispose() {
    disposed = true;
    host = void 0;
    for (const portrait of cache.values()) {
      portrait.thumbnail.image.remove();
      cancel(portrait.thumbnail);
      if (portrait.full) {
        portrait.full.image.remove();
        cancel(portrait.full);
      }
    }
    cache.clear();
    wanted = [];
  }
  return { prepare, show, dispose };
}
function PeopleTower({ members, onStatusChange }) {
  const sorted = useMemo(
    () => sortTeamMembers(members),
    [members]
  );
  const story = useRef(null), host = useRef(null);
  const [status, setStatus] = useState("loading");
  const [active, setActive] = useState(-1);
  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);
  const memberKey = useMemo(() => JSON.stringify(sorted), [sorted]);
  const controller = useRef(null);
  useEffect(() => {
    const element = host.current, section = story.current;
    if (!element || !section || !sorted.length) {
      setStatus("still");
      return;
    }
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const portraits = createTowerPortraits(sorted, matchMedia("(max-width: 768px), (pointer: coarse)").matches);
    if (!media.matches) portraits.prepare(0);
    let disposed = false, generation = 0;
    let idle = 0, timer = 0;
    let cleanup;
    function stop() {
      controller.current = null;
      const dispose = cleanup;
      cleanup = void 0;
      dispose?.();
    }
    async function start() {
      if (disposed) return;
      if (idle) {
        cancelIdleCallback(idle);
        idle = 0;
      }
      window.clearTimeout(timer);
      const current = ++generation;
      stop();
      setActive(-1);
      if (media.matches) {
        setStatus("still");
        return;
      }
      portraits.prepare(0);
      setStatus("loading");
      try {
        const { createPeopleTower } = await import("./people-tower-DraQuqUZ.js");
        if (disposed || current !== generation) return;
        const tower = await createPeopleTower(element, section, sorted, {
          onMember: (index) => {
            if (!disposed && current === generation) setActive(index);
          },
          onError: () => {
            if (!disposed && current === generation) {
              generation++;
              stop();
              setStatus("fallback");
              setActive(-1);
            }
          }
        }, portraits);
        if (disposed || current !== generation) {
          tower.dispose();
          return;
        }
        cleanup = tower.dispose;
        controller.current = tower;
        setStatus("ready");
      } catch {
        if (!disposed && current === generation) {
          stop();
          setStatus("fallback");
          setActive(-1);
        }
      }
    }
    if (typeof requestIdleCallback !== "undefined") idle = requestIdleCallback(() => void start(), { timeout: 2e3 });
    else timer = window.setTimeout(() => void start(), 100);
    media.addEventListener("change", start);
    return () => {
      disposed = true;
      generation++;
      if (idle) cancelIdleCallback(idle);
      window.clearTimeout(timer);
      media.removeEventListener("change", start);
      stop();
      portraits.dispose();
    };
  }, [memberKey]);
  function revealMember(index) {
    const section = story.current;
    if (!section || status !== "ready") return;
    controller.current?.seek(memberProgress(index, sorted.length));
    section.querySelector("select")?.focus({ preventScroll: true });
  }
  return /* @__PURE__ */ jsxs("section", { className: "people-tower-view", "aria-label": "Interactive team tower", "data-tower-status": status, children: [
    (status === "loading" || status === "still" || status === "fallback") && /* @__PURE__ */ jsx("p", { className: "people-tower__status", role: "status", children: status === "loading" ? "Building the interactive tower..." : status === "still" ? "The tower is paused for reduced motion. Go back to the team to meet everyone." : "The tower could not start on this device. Go back to the team to meet everyone." }),
    /* @__PURE__ */ jsx("div", { className: "people-tower", ref: story, style: {
      "--tower-length": `${sorted.length * 55 + 120}svh`
    }, children: /* @__PURE__ */ jsxs("div", { className: "people-tower__stage", children: [
      /* @__PURE__ */ jsx("div", { className: "people-tower__world", ref: host, "aria-hidden": "true" }),
      /* @__PURE__ */ jsxs("div", { className: "people-tower__finish", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "The",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("em", { children: "whole team." })
        ] }),
        /* @__PURE__ */ jsx("span", { children: "Keep throwing, or scroll back to revisit." })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "people-tower__hint", hidden: status !== "ready", children: [
        /* @__PURE__ */ jsx("span", { className: "people-tower__hint-mouse", children: "Click to pull. Grab, drag and release to throw. Scroll to meet the team." }),
        /* @__PURE__ */ jsx("span", { className: "people-tower__hint-touch", children: "Grab any block. Drag and release to throw. Swipe on the background to meet the team." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "people-tower__hud", hidden: status !== "ready", children: [
        /* @__PURE__ */ jsxs("label", { className: "people-tower__picker", children: [
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Jump to a member" }),
          /* @__PURE__ */ jsxs("select", { value: active < 0 ? "" : active, onChange: (event) => revealMember(Number(event.target.value)), children: [
            /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Meet the members" }),
            sorted.map((member, index) => /* @__PURE__ */ jsx("option", { value: index, children: member.name }, member.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "people-tower__rebuild", "aria-label": "Rebuild tower", onClick: () => controller.current?.rebuild(), children: [
          /* @__PURE__ */ jsx(RotateCcw, { size: 14 }),
          /* @__PURE__ */ jsx("span", { children: "Rebuild tower" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  PeopleTower as default
};
