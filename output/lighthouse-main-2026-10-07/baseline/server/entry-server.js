import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { ServerStyleSheet } from "styled-components";
import { lazy, createElement, useRef, useId, useEffect, useCallback, Component, useState, useMemo, Suspense, useLayoutEffect } from "react";
import { useNavigate, Link, NavLink, useLocation, useNavigationType, Routes, Route } from "react-router-dom";
import { ArrowUpRight, X, Check, LoaderCircle, MessageCircle, BrainCircuit, Code2, Network, ArrowRight, Instagram, Linkedin, Github, Mail, Scan, ArrowLeft, ArrowDown, CalendarDays, MapPin, Orbit, Globe, Search, Asterisk, ArrowDownWideNarrow, Newspaper, RefreshCw } from "lucide-react";
import { useReducedMotion, useAnimationControls, motion, AnimatePresence } from "framer-motion";
import { createPortal, flushSync } from "react-dom";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
function deferredPage(load) {
  let resolved;
  let pending;
  const preload = () => pending ??= load().then((module) => {
    resolved = module.default;
    return module;
  });
  const Lazy = lazy(preload);
  const Page = (props) => createElement(resolved ?? Lazy, props);
  return Object.assign(Page, { preload, register(component) {
    resolved = component;
  } });
}
const EventsPage$2 = deferredPage(() => Promise.resolve().then(() => EventsPage$1));
const WorkPage$2 = deferredPage(() => Promise.resolve().then(() => WorkPage$1));
const PeoplePage$2 = deferredPage(() => Promise.resolve().then(() => PeoplePage$1));
const Recruitment$2 = deferredPage(() => Promise.resolve().then(() => Recruitment$1));
const AchievementsPage$2 = deferredPage(() => Promise.resolve().then(() => AchievementsPage$1));
const LiveNews$2 = deferredPage(() => Promise.resolve().then(() => LiveNews$1));
const pages$1 = { "/events": EventsPage$2, "/projects": WorkPage$2, "/team": PeoplePage$2, "/recruitment": Recruitment$2, "/achievements": AchievementsPage$2, "/news": LiveNews$2, "/live-news": LiveNews$2 };
const preloadPage = (path) => pages$1[path.replace(/\/$/, "")]?.preload() ?? Promise.resolve();
const LIGHTWEIGHT_GRAPHICS = "(max-width: 760px), (pointer: coarse), (prefers-reduced-motion: reduce)";
function useLightweightGraphics() {
  const connection = navigator.connection;
  return matchMedia(LIGHTWEIGHT_GRAPHICS).matches || Boolean(connection?.saveData);
}
const sweepEase = [0.16, 1, 0.3, 1];
const reverseSweepEase = [0.7, 0, 0.84, 0];
const CLOSE_SECONDS = 1.2;
const sweepVariants = { open: { x: "0%" }, closed: { x: "100%" } };
const followSweepFrame = () => {
};
function MorphingNavbar({ items, settings: settings2, open, onOpenChange, onApply }) {
  const navigate = useNavigate();
  const root = useRef(null);
  const toggle = useRef(null);
  const pendingNavigation = useRef(null);
  const closing = useRef(false);
  const reopening = useRef(false);
  const contentId = useId();
  const reducedMotion = useReducedMotion();
  const sweepControls = useAnimationControls();
  useEffect(() => {
    void sweepControls.start(open ? "open" : "closed");
  }, [open, sweepControls]);
  const socials = [
    { title: "Instagram", href: settings2.instagramUrl },
    { title: "LinkedIn", href: settings2.linkedinUrl },
    { title: "Email", href: "mailto:" + settings2.contactEmail }
  ];
  const closeMenu = useCallback(() => {
    closing.current = !reducedMotion && (open || closing.current);
    onOpenChange(false);
    toggle.current?.focus({ preventScroll: true });
  }, [open, onOpenChange, reducedMotion]);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keyboard = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(root.current?.querySelectorAll("a[href], button") ?? []).filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keyboard);
    };
  }, [open, closeMenu]);
  useEffect(() => {
    if (open) {
      pendingNavigation.current = null;
      closing.current = false;
    }
  }, [open]);
  useEffect(() => () => {
    pendingNavigation.current = null;
  }, []);
  const warmPage = (targetHref) => {
    void preloadPage(targetHref).catch(() => {
    });
    if (reducedMotion || useLightweightGraphics()) return;
    if (targetHref === "/team") void import("./assets/people-tower-DraQuqUZ.js").catch(() => {
    });
    if (targetHref === "/") void import("./assets/logo-scene-yNH-R57b.js").catch(() => {
    });
  };
  const closeForNavigation = (event, targetHref) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    warmPage(targetHref);
    pendingNavigation.current = null;
    if (reducedMotion || !open && !closing.current) {
      closeMenu();
      navigate(targetHref);
      return;
    }
    pendingNavigation.current = targetHref;
    closeMenu();
  };
  const finishClose = () => {
    if (open) return;
    closing.current = false;
    const targetHref = pendingNavigation.current;
    pendingNavigation.current = null;
    if (targetHref !== null) navigate(targetHref);
  };
  const sequenceDuration = 1 + Math.max(0.9, 0.5 + Math.max(0, items.length - 1) * 0.1, 0.75 + (socials.length - 1) * 0.1);
  const closeScale = CLOSE_SECONDS / sequenceDuration;
  const sequenceTransition = (delay = 0) => ({
    duration: reducedMotion ? 0 : open ? 1 : closeScale,
    // An interrupted exit must reverse immediately. Reapplying the opening
    // delays lets the old exit keep moving before the new animation starts.
    delay: reducedMotion ? 0 : open ? reopening.current ? 0 : delay : Math.max(0, sequenceDuration - delay - 1) * closeScale,
    ease: open ? sweepEase : reverseSweepEase
  });
  return /* @__PURE__ */ jsx("nav", { ref: root, className: "morph-nav", "aria-label": "Main navigation", "data-open": open, children: /* @__PURE__ */ jsxs("div", { className: "morph-nav__dialog", role: open ? "dialog" : void 0, "aria-modal": open ? true : void 0, "aria-label": open ? "Navigation menu" : void 0, children: [
    /* @__PURE__ */ jsxs("div", { className: "morph-nav__pill", children: [
      /* @__PURE__ */ jsx(Link, { className: "morph-nav__brand", to: "/", "aria-label": "Nucleus home", onClick: (event) => closeForNavigation(event, "/"), children: "Nucleus" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "morph-nav__toggle",
          ref: toggle,
          "aria-label": open ? "Close menu" : "Open menu",
          "aria-controls": contentId,
          "aria-expanded": open,
          onClick: () => {
            pendingNavigation.current = null;
            if (open) closeMenu();
            else {
              reopening.current = closing.current;
              if (closing.current) sweepControls.stop();
              closing.current = false;
              onOpenChange(true);
            }
          },
          children: /* @__PURE__ */ jsxs("span", { className: "morph-nav__glyph", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx(motion.span, { initial: false, animate: { y: open ? 0 : -3, rotate: open ? 45 : 0 }, transition: { duration: reducedMotion ? 0 : 0.3 } }),
            /* @__PURE__ */ jsx(motion.span, { initial: false, animate: { y: open ? 0 : 3, rotate: open ? -45 : 0 }, transition: { duration: reducedMotion ? 0 : 0.3 } })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        id: contentId,
        className: "morph-nav__overlay",
        "data-lenis-prevent": true,
        "aria-hidden": !open,
        inert: !open,
        initial: "closed",
        variants: sweepVariants,
        animate: sweepControls,
        transition: sequenceTransition(),
        onUpdate: (latest) => {
          if (!open && closing.current && Number.parseFloat(String(latest.x)) >= 50) finishClose();
        },
        onAnimationComplete: (definition) => {
          if (definition === "closed") finishClose();
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "morph-nav__bands", "aria-hidden": "true", children: Array.from({ length: 5 }, (_, index) => /* @__PURE__ */ jsx(
            motion.div,
            {
              className: "morph-nav__band",
              initial: "closed",
              variants: sweepVariants,
              animate: sweepControls,
              onUpdate: followSweepFrame,
              transition: sequenceTransition(index * 0.075)
            },
            index
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "morph-nav__content", children: [
            /* @__PURE__ */ jsxs("div", { className: "morph-nav__main", children: [
              /* @__PURE__ */ jsx("ul", { className: "morph-nav__links", children: items.map((item, index) => /* @__PURE__ */ jsx(
                motion.li,
                {
                  initial: false,
                  animate: { opacity: open ? 1 : 0, x: open ? 0 : 160 },
                  transition: sequenceTransition(0.5 + index * 0.1),
                  children: /* @__PURE__ */ jsxs(NavLink, { className: "morph-nav__link", to: item.href, end: true, "aria-label": item.title, onPointerEnter: () => {
                    if (open && !useLightweightGraphics()) warmPage(item.href);
                  }, onFocus: () => {
                    if (open) void preloadPage(item.href).catch(() => {
                    });
                  }, onClick: (event) => closeForNavigation(event, item.href), children: [
                    /* @__PURE__ */ jsx("span", { className: "morph-nav__active-dot", "aria-hidden": "true" }),
                    /* @__PURE__ */ jsx("span", { className: "morph-nav__title", "aria-hidden": "true", children: Array.from(item.title).map((letter, letterIndex) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "morph-nav__letter",
                        style: { "--letter-index": letterIndex },
                        children: letter === " " ? " " : letter
                      },
                      letterIndex
                    )) })
                  ] })
                },
                item.href
              )) }),
              /* @__PURE__ */ jsx("ul", { className: "morph-nav__socials", "aria-label": "Social links", children: socials.map((item, index) => /* @__PURE__ */ jsx(
                motion.li,
                {
                  initial: false,
                  animate: { opacity: open ? 1 : 0, x: open ? 0 : 160 },
                  transition: sequenceTransition(0.75 + index * 0.1),
                  children: /* @__PURE__ */ jsxs("a", { href: item.href, target: item.title === "Email" ? void 0 : "_blank", rel: item.title === "Email" ? void 0 : "noreferrer", children: [
                    item.title,
                    /* @__PURE__ */ jsx(ArrowUpRight, { size: 14, "aria-hidden": "true" })
                  ] })
                },
                item.title
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "morph-nav__footer", children: [
              /* @__PURE__ */ jsxs(motion.div, { initial: false, animate: { opacity: open ? 1 : 0, y: open ? 0 : 100 }, transition: sequenceTransition(0.75), children: [
                /* @__PURE__ */ jsx("span", { className: "morph-nav__caption", children: "Made of many minds" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "© ",
                  (/* @__PURE__ */ new Date()).getFullYear(),
                  " Nucleus SJEC"
                ] })
              ] }),
              /* @__PURE__ */ jsxs(motion.div, { initial: false, animate: { opacity: open ? 1 : 0, y: open ? 0 : 100 }, transition: sequenceTransition(0.9), children: [
                /* @__PURE__ */ jsx("span", { className: "morph-nav__caption", children: "The community" }),
                /* @__PURE__ */ jsxs("button", { className: "morph-nav__join", onClick: () => {
                  pendingNavigation.current = null;
                  closeMenu();
                  onApply();
                }, children: [
                  settings2.recruitmentOpen ? "Join Nucleus" : "Stay connected",
                  /* @__PURE__ */ jsx(ArrowUpRight, { size: 16, "aria-hidden": "true" })
                ] })
              ] })
            ] })
          ] })
        ]
      }
    )
  ] }) });
}
const logoUrl = "/assets/nucleus-logo-D2TergAO.webp";
function Logo({ className = "" }) {
  return /* @__PURE__ */ jsx("svg", { className: `brand-mark ${className}`, viewBox: "430 128 672 625", "aria-hidden": "true", width: "56", height: "56", children: /* @__PURE__ */ jsx("image", { href: logoUrl, width: "1599", height: "899" }) });
}
function Modal({ title, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    const keepFocus = (event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(element.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((control) => !control.matches(":disabled, [hidden]") && control.getClientRects().length > 0);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    element.addEventListener("keydown", keepFocus);
    return () => {
      element.removeEventListener("keydown", keepFocus);
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return createPortal(/* @__PURE__ */ jsxs("dialog", { ref: dialog, className: "modal", "data-lenis-prevent": true, "aria-labelledby": "modal-title", onCancel: onClose, onClick: (e) => {
    if (e.target === e.currentTarget) {
      const r = e.currentTarget.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
    }
  }, children: [
    /* @__PURE__ */ jsx("button", { className: "icon-button modal-close", onClick: onClose, "aria-label": "Close dialog", children: /* @__PURE__ */ jsx(X, { size: 20 }) }),
    /* @__PURE__ */ jsx("h2", { id: "modal-title", children: title }),
    children
  ] }), document.body);
}
class PageBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return /* @__PURE__ */ jsxs("section", { className: "recruitment-page section-wrap", role: "alert", children: [
      /* @__PURE__ */ jsx("h1", { children: "This page couldn’t load." }),
      /* @__PURE__ */ jsx("p", { children: "Please try again." }),
      /* @__PURE__ */ jsx("button", { className: "button primary", onClick: () => window.location.reload(), children: "Reload page" })
    ] });
    return this.props.children;
  }
}
const desktopSequence = "/assets/sequence-DzioxCJL.mp4";
const desktopPoster = "/assets/still-RQhG7sxV.webp";
const mobileSequence = "/assets/sequence-C837p4cp.mp4";
const mobilePoster = "/assets/still-BlIWZ3vH.webp";
const compactQueries = ["(max-width: 767px)", "(max-height: 500px) and (max-width: 1024px)", "(pointer: coarse)"];
const compactMedia = compactQueries.join(", ");
const portraitMedia = "(orientation: portrait)";
function LoadingOverlay({ message }) {
  const reduced = useReducedMotion() === true;
  const [compact, setCompact] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    const media = matchMedia(compactMedia);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    let disposed = false;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const portraitPreference = matchMedia(portraitMedia);
    let request, objectUrl = "", selected = "";
    const playback = () => {
      if (document.hidden || preference.matches) {
        video.pause();
        return;
      }
      void video.play().catch(() => {
        if (!disposed) setReady(false);
      });
    };
    const select = async () => {
      const source = preference.matches ? "" : portraitPreference.matches ? mobileSequence : desktopSequence;
      if (source === selected) {
        playback();
        return;
      }
      selected = source;
      request?.abort();
      video.pause();
      setReady(false);
      video.removeAttribute("src");
      video.load();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = "";
      }
      if (!source) return;
      const pending = request = new AbortController();
      try {
        const response = await fetch(source, { signal: pending.signal });
        if (!response.ok) throw new Error("Loading artwork unavailable");
        const blob = await response.blob();
        if (disposed || pending.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        playback();
      } catch {
      }
    };
    void select();
    document.addEventListener("visibilitychange", playback);
    preference.addEventListener("change", select);
    portraitPreference.addEventListener("change", select);
    return () => {
      disposed = true;
      request?.abort();
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      document.removeEventListener("visibilitychange", playback);
      preference.removeEventListener("change", select);
      portraitPreference.removeEventListener("change", select);
    };
  }, []);
  useEffect(() => {
    const root = document.documentElement, body = document.body;
    const rootOverflow = root.style.overflow, bodyOverflow = body.style.overflow;
    const gutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = body.style.overflow = "hidden";
    return () => {
      root.style.overflow = rootOverflow;
      body.style.overflow = bodyOverflow;
      root.style.scrollbarGutter = gutter;
    };
  }, []);
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      className: "nucleus-loader",
      "data-loading-screen": "",
      "data-frames-ready": ready && !reduced,
      "data-art-failed": failed,
      "data-lenis-prevent": "",
      initial: { x: "0%" },
      exit: { x: reduced ? "0%" : "-100%" },
      transition: { type: "tween", duration: reduced ? 0 : compact ? 0.35 : 0.45, ease: [0.77, 0, 0.175, 1] },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "nucleus-loader__art", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxs("picture", { className: "nucleus-loader__poster", children: [
            /* @__PURE__ */ jsx("source", { media: portraitMedia, srcSet: mobilePoster }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: desktopPoster,
                alt: "",
                width: 1440,
                height: 810,
                decoding: "async",
                fetchPriority: "high",
                onError: () => setFailed(true),
                onLoad: () => setFailed(false)
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "video",
            {
              ref: videoRef,
              className: "nucleus-loader__video",
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
              preload: "auto",
              disablePictureInPicture: true,
              tabIndex: -1,
              onPlaying: () => setReady(true),
              onError: () => setReady(false)
            }
          ),
          failed && !ready && /* @__PURE__ */ jsx("span", { className: "nucleus-loader__fallback", children: "Nucleus" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", role: "status", "aria-live": "polite", "aria-atomic": "true", children: message })
      ]
    }
  );
}
function LoadingScreen({ active = true, message = "Connecting the dots…", onExitComplete }) {
  return /* @__PURE__ */ jsx(AnimatePresence, { onExitComplete, children: active && /* @__PURE__ */ jsx(LoadingOverlay, { message }, "nucleus-loading-screen") });
}
const LOADER_MINIMUM_MS = 1400;
const LOADER_MAXIMUM_MS = 1500;
async function api(path, options) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { ...options?.body ? { "Content-Type": "application/json" } : {}, ...options?.headers },
    credentials: "same-origin"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path.startsWith("/admin/") && path !== "/admin/login" && typeof window !== "undefined") {
      window.dispatchEvent(new Event("nucleus:session-expired"));
    }
    throw new ApiError(data.error || "The connection was interrupted. Please try again.", response.status);
  }
  return data;
}
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
  status;
}
const supabaseUrl = "https://diqzjvlcowxhbzrvplqb.supabase.co";
const supabaseAnonKey = "sb_publishable_NVP5s5fJMyLrAJVZvK0F5w_CbOcbEru";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabase$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  supabase
}, Symbol.toStringTag, { value: "Module" }));
function RecruitmentApplication({ initialSettings }) {
  const [settings2, setSettings] = useState(initialSettings);
  const [availability, setAvailability] = useState("checking");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [reference, setReference] = useState("");
  const request = useRef(null);
  const success = useRef(null);
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => {
      if (request.current === controller) {
        setAvailability("error");
        controller.abort();
      }
    }, 1e4);
    try {
      const site = await api("/site", { signal: controller.signal });
      if (!controller.signal.aborted) {
        setSettings(site.settings);
        setAvailability("ready");
      }
    } catch {
      if (!controller.signal.aborted) setAvailability("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const recheck = () => {
      if (!document.hidden) void refresh();
    };
    const interval = window.setInterval(recheck, 6e4);
    window.addEventListener("focus", recheck);
    window.addEventListener("online", recheck);
    return () => {
      request.current?.abort();
      clearInterval(interval);
      window.removeEventListener("focus", recheck);
      window.removeEventListener("online", recheck);
    };
  }, [refresh]);
  useEffect(() => {
    if (reference) success.current?.focus();
  }, [reference]);
  async function submit(event) {
    event.preventDefault();
    if (busy || availability !== "ready" || !settings2.recruitmentOpen) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      const result = await api("/applications", { method: "POST", body: JSON.stringify({ ...fields, consent: fields.consent === "on" }) });
      setReference(result.id);
    } catch (failure) {
      setError(failure.message);
      if (failure instanceof ApiError && failure.status === 409) void refresh();
    } finally {
      setBusy(false);
    }
  }
  if (reference) return /* @__PURE__ */ jsxs("div", { className: "success-panel recruitment-success", role: "status", tabIndex: -1, ref: success, children: [
    /* @__PURE__ */ jsx("span", { className: "success-icon", children: /* @__PURE__ */ jsx(Check, { "aria-hidden": "true" }) }),
    /* @__PURE__ */ jsx("h3", { children: "Application received." }),
    /* @__PURE__ */ jsx("p", { children: "Your application is saved. The team will review it and contact you using the email you provided." }),
    /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Your application reference" }),
    /* @__PURE__ */ jsx("code", { children: reference }),
    /* @__PURE__ */ jsx("p", { children: "Save this number if you need to follow up." })
  ] });
  if (availability === "checking") return /* @__PURE__ */ jsxs("p", { className: "recruitment-status", role: "status", children: [
    /* @__PURE__ */ jsx(LoaderCircle, { size: 18, className: "spin" }),
    "Checking recruitment availability…"
  ] });
  if (availability === "ready" && !settings2.recruitmentOpen) return /* @__PURE__ */ jsxs("div", { className: "recruitment-application recruitment-closed", children: [
    /* @__PURE__ */ jsx("h2", { children: "Registrations are closed." }),
    /* @__PURE__ */ jsx("p", { children: settings2.recruitmentNextOpening ? `Next intake: ${settings2.recruitmentNextOpening}` : "The next intake has not been announced. Opening dates will be posted here." }),
    /* @__PURE__ */ jsxs("div", { className: "recruitment-closed-links", children: [
      settings2.instagramUrl && /* @__PURE__ */ jsx("a", { href: settings2.instagramUrl, target: "_blank", rel: "noreferrer", children: "Updates on Instagram" }),
      /* @__PURE__ */ jsx("a", { href: `mailto:${settings2.contactEmail}`, children: "Contact the team" })
    ] })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "recruitment-application", children: [
    availability === "error" && /* @__PURE__ */ jsxs("div", { className: "form-error", role: "alert", children: [
      "We couldn’t check recruitment availability. Please reconnect and try again.",
      /* @__PURE__ */ jsx("button", { type: "button", className: "button outline", onClick: () => void refresh(), children: "Try again" })
    ] }),
    settings2.recruitmentOpen && /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "application-form", children: [
      /* @__PURE__ */ jsxs("fieldset", { disabled: busy || availability !== "ready", children: [
        /* @__PURE__ */ jsx("legend", { children: "Basic information" }),
        settings2.recruitmentDeadline && /* @__PURE__ */ jsxs("p", { className: "recruitment-deadline", children: [
          "Apply by ",
          new Date(settings2.recruitmentDeadline).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-grid", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            "Your name",
            /* @__PURE__ */ jsx("input", { name: "name", autoComplete: "name", required: true, minLength: 2, maxLength: 100, placeholder: "Full name" })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            "Email address",
            /* @__PURE__ */ jsx("input", { name: "email", type: "email", autoComplete: "email", required: true, maxLength: 254, placeholder: "you@example.com" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-grid", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            "Year of study",
            /* @__PURE__ */ jsxs("select", { name: "year", required: true, defaultValue: "", children: [
              /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "Select year" }),
              /* @__PURE__ */ jsx("option", { value: "1", children: "1st year" }),
              /* @__PURE__ */ jsx("option", { value: "2", children: "2nd year" }),
              /* @__PURE__ */ jsx("option", { value: "3", children: "3rd year" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            "Your domain",
            /* @__PURE__ */ jsxs("select", { name: "domain", required: true, defaultValue: "", children: [
              /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: "What interests you?" }),
              /* @__PURE__ */ jsx("option", { value: "aiml", children: "AI & Machine Learning" }),
              /* @__PURE__ */ jsx("option", { value: "web", children: "Web Development" }),
              /* @__PURE__ */ jsx("option", { value: "dsa", children: "Data Structures & Algorithms" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "What would you like to learn or build?",
          /* @__PURE__ */ jsx("textarea", { name: "motivation", rows: 4, minLength: 30, maxLength: 1600, required: true, placeholder: "Tell us what makes you curious. No perfect answers needed. (30+ characters)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("fieldset", { disabled: busy || availability !== "ready", children: [
        /* @__PURE__ */ jsxs("legend", { children: [
          "Social & portfolio links ",
          /* @__PURE__ */ jsx("span", { className: "muted", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "recruitment-hint", children: "Share the profiles you have. You don’t need an account on every platform to apply." }),
        /* @__PURE__ */ jsx("div", { className: "form-grid", children: [["linkedin", "LinkedIn", "https://www.linkedin.com/in/your-name"], ["github", "GitHub", "https://github.com/your-name"], ["leetcode", "LeetCode", "https://leetcode.com/u/your-name"], ["portfolio", "Other / portfolio", "https://your-website.com"]].map(([name, label, placeholder]) => /* @__PURE__ */ jsxs("label", { children: [
          label,
          /* @__PURE__ */ jsx("input", { name, type: "url", inputMode: "url", autoCapitalize: "none", spellCheck: false, maxLength: 500, placeholder })
        ] }, name)) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "honeypot", "aria-hidden": "true", children: [
        "Leave this empty",
        /* @__PURE__ */ jsx("input", { name: "website", tabIndex: -1, autoComplete: "off" })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "checkbox-label", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", name: "consent", required: true, disabled: busy || availability !== "ready" }),
        /* @__PURE__ */ jsx("span", { children: "I agree that the Nucleus team may use these details to review my application and contact me about recruitment." })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "small muted", children: [
        "Only club administrators can access applications. To request correction or deletion, email ",
        settings2.contactEmail,
        "."
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "form-error", role: "alert", children: error }),
      /* @__PURE__ */ jsx("button", { className: "button primary full-width", disabled: busy || availability !== "ready", children: busy ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(LoaderCircle, { className: "spin", size: 18 }),
        "Sending application…"
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "Send application ",
        /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("a", { className: "text-link recruitment-contact", href: `mailto:${settings2.contactEmail}`, children: [
      "Contact the team ",
      /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
    ] })
  ] });
}
const settings = { "recruitmentOpen": false, "recruitmentMessage": "Recruitment is currently closed. Follow our community for the next intake and results updates.", "recruitmentDeadline": "", "cycle": "2026", "contactEmail": "nucleussjec@gmail.com", "instagramUrl": "https://www.instagram.com/nucleus_sjec/", "githubUrl": "https://github.com/nucleus-sjec", "linkedinUrl": "https://www.linkedin.com/company/nucleus-sjec/" };
const events = [{ "id": "inaugural-2026", "title": "The first connection", "description": "The official inauguration of Nucleus. A beginning for a community of curious minds, ambitious builders, and future collaborators at SJEC.", "startsAt": "2026-03-12T05:30:00.000Z", "endsAt": "2026-03-12T06:15:00.000Z", "location": "St. Joseph Engineering College, Mangaluru", "category": "Inauguration", "registrationUrl": "", "published": true }, { "id": "ai-workshop-2026", "title": "Beyond the baseline", "description": "AI is the baseline. How do you stand out? A session with Chandan Jha exploring what it means to build your own edge in a world shaped by artificial intelligence.", "startsAt": "2026-03-12T06:15:00.000Z", "endsAt": "", "location": "St. Joseph Engineering College, Mangaluru", "category": "AI workshop", "registrationUrl": "", "published": true }, { "id": "recruitment-2026", "title": "Find your people", "description": "Our March 2026 recruitment brought together students interested in learning, building, and contributing to Nucleus. Follow our recruitment updates for the next opportunity to join.", "startsAt": "2026-03-12T03:30:00.000Z", "endsAt": "2026-03-15T18:29:00.000Z", "location": "Nucleus · SJEC", "category": "Community", "registrationUrl": "", "published": true }];
const projects = [{ "id": "i-laundroid", "title": "i Laundroid", "description": "A centralized laundry management platform connecting campus life with better logistics. Built to simplify booking, order tracking, and delivery for students and administrators across residential campuses.", "domain": "Web development", "status": "Club project", "url": "", "repositoryUrl": "", "published": true }];
const team = [{ "id": "poorvik", "name": "Poorvik Kuthyala", "role": "President", "initials": "PK", "image": "/team_images/core/Poorvik.avif" }, { "id": "dinol", "name": "Dinol Castelino", "role": "Vice President", "initials": "DC", "image": "/team_images/core/Dinol.avif" }, { "id": "joylin", "name": "Joylin Mathias", "role": "Secretary", "initials": "JM", "image": "/team_images/core/Joylin.avif" }, { "id": "nishanth", "name": "Nishanth Uday Naik", "role": "Plan & Strategy Lead", "initials": "NN", "image": "/team_images/core/Nishanth1.avif" }, { "id": "karthik", "name": "Karthik", "role": "Treasurer", "initials": "K", "image": "/team_images/core/Karthik.avif" }, { "id": "prajwal", "name": "Prajwal Gaonkar", "role": "Technical Lead", "initials": "PG", "image": "/team_images/core/Prajwal.avif" }, { "id": "mohit", "name": "Mohit", "role": "AI & ML Lead", "initials": "M", "image": "/team_images/core/Mohit.avif" }, { "id": "rakshith", "name": "Rakshith Dsouza", "role": "Development Lead", "initials": "RD", "image": "/team_images/core/Rakshith.avif" }, { "id": "navya", "name": "Navya Suvarna", "role": "DSA Lead", "initials": "NS", "image": "/team_images/core/Navya.avif" }, { "id": "deona", "name": "Deona Rego", "role": "Event Lead", "initials": "DR", "image": "/team_images/core/Deona.avif" }, { "id": "sweedan", "name": "Sweedan Cardoza", "role": "Media Lead", "initials": "SC", "image": "/team_images/core/Sweeden.avif" }, { "id": "manvitha", "name": "Manvitha Lewis", "role": "Discipline Head", "initials": "ML", "image": "/team_images/core/Manvitha.avif" }, { "id": "salim", "name": "Salim Pallikal", "role": "Member", "initials": "SP", "image": "/team_images/core/Salim.avif" }, { "id": "nikhitha", "name": "Nikhitha Dsouza", "role": "Member", "initials": "ND", "image": "/team_images/core/Nikhitha.avif" }, { "id": "saniya", "name": "Aisahath Saniya", "role": "Member", "initials": "AS", "image": "/team_images/core/Saniya.avif" }];
const seed = {
  settings,
  events,
  projects,
  team
};
function MorphingText({ texts, className = "", active = true }) {
  const ref = useRef(null);
  const first = useRef(null);
  const second = useRef(null);
  const key = texts.join("\0");
  useEffect(() => {
    const words = key.split("\0");
    const a = first.current, b = second.current;
    const layers = a.parentElement;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hold = 2.6, morph = 0.45, cycle = hold + morph;
    let frame2 = 0, timer = 0, elapsed = 0, visible = true;
    let startedAt = null;
    let lastIndex = -1, lastFraction = -1;
    const paint = (fraction, index) => {
      if (lastIndex === index && lastFraction === fraction) return;
      if (lastIndex !== index) {
        a.textContent = words[index % words.length];
        b.textContent = words[(index + 1) % words.length];
        lastIndex = index;
      }
      lastFraction = fraction;
      if (fraction === 0) {
        layers.style.filter = "none";
        a.style.filter = b.style.filter = "none";
        a.style.opacity = "1";
        b.style.opacity = "0";
        a.style.transform = b.style.transform = "none";
        layers.style.willChange = "auto";
        return;
      }
      a.style.opacity = String(Math.max(0, 1 - fraction * 2));
      b.style.opacity = String(Math.max(0, fraction * 2 - 1));
      a.style.transform = `translateY(${Math.round(-fraction * 8)}px)`;
      b.style.transform = `translateY(${Math.round((1 - fraction) * 8)}px)`;
    };
    const animate = (now) => {
      if (startedAt === null) return;
      const time = elapsed + (now - startedAt) / 1e3;
      const index = Math.floor(time / cycle), phase2 = time % cycle;
      const progress = Math.max(0, (phase2 - hold) / morph);
      paint(progress * progress * progress * (progress * (progress * 6 - 15) + 10), index);
      if (phase2 < hold) timer = window.setTimeout(() => {
        frame2 = requestAnimationFrame(animate);
      }, (hold - phase2) * 1e3);
      else frame2 = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(frame2);
      clearTimeout(timer);
      const now = performance.now();
      if (startedAt !== null) elapsed += (now - startedAt) / 1e3;
      startedAt = null;
      if (!active || media.matches) {
        elapsed = 0;
        paint(0, 0);
        return;
      }
      if (visible && !document.hidden && words.length > 1) {
        startedAt = now;
        frame2 = requestAnimationFrame(animate);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    if (ref.current) observer.observe(ref.current);
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame2);
      clearTimeout(timer);
      startedAt = null;
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [key, active]);
  return /* @__PURE__ */ jsx("div", { ref, className: `mu-morph-wrap ${className}`, role: "group", "aria-label": texts.join(". "), children: /* @__PURE__ */ jsxs("div", { className: "mu-morph-layers", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("span", { className: "mu-layer", ref: first, children: texts[0] }),
    /* @__PURE__ */ jsx("span", { className: "mu-layer", ref: second, style: { opacity: 0 }, children: texts[1] })
  ] }) });
}
const effects = /* @__PURE__ */ new Set();
let frame = 0, dirty = true;
let stop;
function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}
function measure() {
  dirty = true;
  schedule();
}
function flush() {
  frame = 0;
  const viewport = window.innerHeight, scroll = window.scrollY;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (dirty) for (const effect of effects) {
    let top = 0;
    for (let node = effect.element; node; node = node.offsetParent) top += node.offsetTop;
    effect.top = top;
    effect.height = effect.element.offsetHeight;
  }
  dirty = false;
  for (const effect of effects) effect.paint({ top: effect.top - scroll, height: effect.height, viewport, reduced });
}
function observeScroll(element, paint) {
  const effect = { element, paint, top: 0, height: 0 };
  effects.add(effect);
  if (!stop) {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    media.addEventListener("change", measure);
    document.fonts.addEventListener("loadingdone", measure);
    stop = () => {
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      media.removeEventListener("change", measure);
      document.fonts.removeEventListener("loadingdone", measure);
      cancelAnimationFrame(frame);
      frame = 0;
      stop = void 0;
    };
  }
  measure();
  return () => {
    effects.delete(effect);
    if (!effects.size) stop?.();
  };
}
const clampProgress = (value) => Math.max(0, Math.min(1, value));
function LogoLanding({ active = true }) {
  const sectionRef = useRef(null);
  const host = useRef(null);
  const [status, setStatus] = useState("loading");
  const [formed, setFormed] = useState(false);
  const textReady = formed || status === "still" || status === "fallback";
  useEffect(() => {
    const section = sectionRef.current;
    const text = section.querySelector(".logo-landing__text");
    let previous = -1;
    return observeScroll(section, ({ top, height, reduced }) => {
      const progress = reduced ? 0 : clampProgress(-top / Math.max(1, height));
      if (progress === previous) return;
      previous = progress;
      host.current.style.transform = `translateY(${progress * 12}%) scale(${1 - progress * 0.06})`;
      host.current.style.opacity = String(1 - progress * 0.88);
      text.style.transform = `translateY(${-progress * 28}%)`;
      text.style.opacity = String(1 - progress);
    });
  }, []);
  useEffect(() => {
    const motion2 = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!active) {
      if (!motion2.matches) void import("./assets/logo-scene-yNH-R57b.js").catch(() => {
      });
      return;
    }
    const element = host.current;
    let disposed = false;
    let generation = 0;
    let disposeScene;
    let idle = 0, timer = 0;
    let visible = false;
    async function start() {
      const current = ++generation;
      disposeScene?.();
      disposeScene = void 0;
      setFormed(false);
      setStatus("loading");
      if (motion2.matches) {
        setStatus("still");
        return;
      }
      if (!visible || document.hidden) return;
      try {
        const { createLogoScene } = await import("./assets/logo-scene-yNH-R57b.js");
        if (disposed || current !== generation) return;
        const cleanup = await createLogoScene(element, logoUrl, () => {
          if (!disposed && current === generation) setStatus("fallback");
        }, () => {
          if (!disposed && current === generation) setFormed(true);
        });
        if (disposed || current !== generation) cleanup();
        else {
          disposeScene = cleanup;
          setStatus("ready");
        }
      } catch (err) {
        console.error("Logo animation failed:", err);
        if (!disposed && current === generation) setStatus("fallback");
      }
    }
    const schedule2 = () => {
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
      if (typeof window.requestIdleCallback === "function") idle = requestIdleCallback(() => void start(), { timeout: 1200 });
      else timer = window.setTimeout(() => void start(), 80);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !disposeScene) schedule2();
    });
    observer.observe(element);
    if (motion2.matches) setStatus("still");
    const visibility = () => {
      if (!document.hidden && !disposeScene) schedule2();
    };
    motion2.addEventListener("change", schedule2);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      generation++;
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
      observer.disconnect();
      motion2.removeEventListener("change", schedule2);
      document.removeEventListener("visibilitychange", visibility);
      disposeScene?.();
    };
  }, [active]);
  return /* @__PURE__ */ jsxs("section", { ref: sectionRef, className: "logo-landing", "aria-label": "Nucleus", "data-status": status, "data-active": active, "data-text-ready": textReady, children: [
    /* @__PURE__ */ jsx("h1", { className: "sr-only", children: "Nucleus SJEC — A connection worth making." }),
    /* @__PURE__ */ jsx("div", { className: "logo-landing__scene", ref: host, role: "img", "aria-label": "The Nucleus brain logo assembles from a field of luminous particles." }),
    /* @__PURE__ */ jsx("svg", { className: "logo-landing__fallback", viewBox: "430 128 672 625", "aria-hidden": "true", children: /* @__PURE__ */ jsx("image", { href: logoUrl, width: "1599", height: "899" }) }),
    /* @__PURE__ */ jsx("div", { className: "logo-landing__text", children: /* @__PURE__ */ jsx(MorphingText, { texts: ["THE NUCLEUS CLUB", "CREATE", "EXPLORE", "INNOVATE"], active: textReady }) })
  ] });
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const PULSE_MS = 420;
const MAX_WAVES = 2;
const CLICK_INTERVAL_MS = 120;
const BackgroundRippleEffect = ({ className, rows, cols, cellSize = 56 }) => {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const hoverRef = useRef(null);
  useEffect(() => {
    const container = ref.current;
    const surface = container.parentElement;
    const canvas = canvasRef.current;
    const hover = hoverRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    const motion2 = matchMedia("(prefers-reduced-motion: reduce)");
    const touch = matchMedia("(pointer: coarse)");
    const memory = navigator.deviceMemory;
    const lowEnd = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4 || memory !== void 0 && memory > 0 && memory <= 4;
    let width = 0, height = 0, gridRows = 0, gridCols = 0;
    let frame2 = 0, lastPaint = 0, lastClick = -Infinity;
    const waves = Array.from({ length: MAX_WAVES }, () => ({ started: 0, cells: new Float32Array(25 * 25 * 4), count: 0, active: false }));
    let stencil = new Float32Array(0), radius = 12, nextWave = 0;
    let hovered = null;
    let bounds;
    const clearHover = () => {
      hovered = null;
      hover.hidden = true;
    };
    const stop2 = () => {
      cancelAnimationFrame(frame2);
      frame2 = 0;
      for (const wave of waves) wave.active = false;
      nextWave = 0;
      lastPaint = 0;
      lastClick = -Infinity;
      context.clearRect(0, 0, width, height);
      container.dataset.activeWaves = "0";
      clearHover();
    };
    const resize = () => {
      stop2();
      bounds = void 0;
      width = container.clientWidth;
      height = container.clientHeight;
      gridRows = rows ?? Math.ceil(height / cellSize);
      gridCols = cols ?? Math.ceil(width / cellSize);
      const nextRadius = lowEnd ? 5 : touch.matches ? 7 : 12;
      if (!stencil.length || nextRadius !== radius) {
        radius = nextRadius;
        const values = [];
        for (let row = -radius; row <= radius; row++) {
          for (let col = -radius; col <= radius; col++) {
            const distance = Math.hypot(row, col);
            if (distance <= radius) values.push(col * cellSize, row * cellSize, distance * 45, 1 - distance / (radius + 1));
          }
        }
        stencil = new Float32Array(values);
      }
      const scale = Math.min(devicePixelRatio || 1, lowEnd ? 0.75 : touch.matches ? 1 : 1.5, Math.sqrt((lowEnd ? 35e4 : 15e5) / Math.max(1, width * height)));
      canvas.width = Math.max(1, Math.floor(width * scale));
      canvas.height = Math.max(1, Math.floor(height * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const paint = (time) => {
      frame2 = 0;
      if (document.hidden || motion2.matches) {
        stop2();
        return;
      }
      if (time - lastPaint < 1e3 / (lowEnd ? 24 : touch.matches ? 30 : 60) - 1) {
        frame2 = requestAnimationFrame(paint);
        return;
      }
      lastPaint = time;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#c3e5c8";
      let activeCount = 0;
      for (const wave of waves) {
        if (!wave.active) continue;
        const elapsed = time - wave.started;
        if (elapsed >= radius * 45 + PULSE_MS) {
          wave.active = false;
          continue;
        }
        activeCount++;
        for (let index = 0; index < wave.count; index += 4) {
          const progress = (elapsed - wave.cells[index + 2]) / PULSE_MS;
          if (progress <= 0 || progress >= 1) continue;
          context.globalAlpha = Math.sin(progress * Math.PI) * wave.cells[index + 3] * 0.22;
          context.fillRect(wave.cells[index] + 1, wave.cells[index + 1] + 1, cellSize - 2, cellSize - 2);
        }
      }
      context.globalAlpha = 1;
      const count = String(activeCount);
      if (container.dataset.activeWaves !== count) container.dataset.activeWaves = count;
      if (activeCount) frame2 = requestAnimationFrame(paint);
    };
    const getCell = (event) => {
      if (motion2.matches || document.hidden || surface.closest("[inert]")) return null;
      if (event.target instanceof Element && event.target.closest('a, button, input, textarea, select, [role="button"], [role="dialog"], dialog, [inert]')) return null;
      bounds ??= container.getBoundingClientRect();
      const col = Math.floor((event.clientX - bounds.left) / cellSize);
      const row = Math.floor((event.clientY - bounds.top) / cellSize);
      return row >= 0 && row < gridRows && col >= 0 && col < gridCols ? { row, col } : null;
    };
    const move = (event) => {
      if (event.pointerType !== "mouse") return;
      const cell = getCell(event);
      if (!cell) {
        clearHover();
        return;
      }
      if (cell.row === hovered?.row && cell.col === hovered.col) return;
      hovered = cell;
      hover.style.transform = `translate(${cell.col * cellSize}px, ${cell.row * cellSize}px)`;
      hover.hidden = false;
    };
    const click = (event) => {
      const now = performance.now();
      if (now - lastClick < CLICK_INTERVAL_MS) return;
      const origin = getCell(event);
      if (!origin) return;
      lastClick = now;
      const wave = waves[nextWave];
      nextWave = (nextWave + 1) % (lowEnd ? 1 : MAX_WAVES);
      wave.started = now;
      wave.active = true;
      wave.count = 0;
      const edgeX = Math.min(width, gridCols * cellSize), edgeY = Math.min(height, gridRows * cellSize);
      for (let index = 0; index < stencil.length; index += 4) {
        const x = origin.col * cellSize + stencil[index], y = origin.row * cellSize + stencil[index + 1];
        if (x < 0 || y < 0 || x >= edgeX || y >= edgeY) continue;
        wave.cells[wave.count++] = x;
        wave.cells[wave.count++] = y;
        wave.cells[wave.count++] = stencil[index + 2];
        wave.cells[wave.count++] = stencil[index + 3];
      }
      let activeCount = 0;
      for (const item of waves) if (item.active) activeCount++;
      container.dataset.activeWaves = String(activeCount);
      if (!frame2) frame2 = requestAnimationFrame(paint);
    };
    const invalidate = () => {
      bounds = void 0;
      clearHover();
    };
    const visibility = () => {
      if (document.hidden) stop2();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    surface.addEventListener("click", click);
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", clearHover);
    surface.addEventListener("pointercancel", clearHover);
    window.addEventListener("scroll", invalidate, { passive: true, capture: true });
    motion2.addEventListener("change", stop2);
    touch.addEventListener("change", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stop2();
      observer.disconnect();
      surface.removeEventListener("click", click);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", clearHover);
      surface.removeEventListener("pointercancel", clearHover);
      window.removeEventListener("scroll", invalidate, true);
      motion2.removeEventListener("change", stop2);
      touch.removeEventListener("change", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [cellSize, rows, cols]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "aria-hidden": "true",
      "data-active-waves": "0",
      className: cn("background-ripple-effect", className),
      style: { "--cell-size": `${cellSize}px` },
      children: /* @__PURE__ */ jsxs("div", { className: "background-ripple-effect__grid", children: [
        /* @__PURE__ */ jsx("div", { ref: hoverRef, className: "background-ripple-effect__hover", hidden: true }),
        /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "background-ripple-effect__canvas" })
      ] })
    }
  );
};
function TextReveal({
  text,
  mode = "letter",
  as = "span",
  delay = 0.1,
  stagger = 0.025,
  duration = 0.5,
  blur = "8px",
  y = 10,
  once = false,
  className,
  ...props
}) {
  const ref = useRef(null);
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  useEffect(() => {
    const root = ref.current;
    const units = Array.from(root.querySelectorAll(".text-reveal__unit"));
    const total = Math.max(0.01, delay + duration + Math.max(0, units.length - 1) * stagger);
    const pixels = Math.min(8, Math.max(0, parseFloat(blur) || 0));
    let held = 0, previous = -1;
    return observeScroll(root, ({ top, viewport, reduced }) => {
      if (root.dataset.revealReady !== String(!reduced)) root.dataset.revealReady = String(!reduced);
      const current = clampProgress((viewport * 0.99 - top) / (viewport * 0.13));
      held = once ? Math.max(held, current) : current;
      const progress = reduced ? 1 : held;
      if (progress === previous) return;
      previous = progress;
      units.forEach((unit, index) => {
        const amount = clampProgress((progress * total - delay - index * stagger) / Math.max(0.01, duration));
        unit.style.opacity = String(1 - (1 - amount) ** 2);
        unit.style.filter = amount === 1 ? "none" : `blur(${((1 - amount) * pixels).toFixed(2)}px)`;
        unit.style.transform = amount === 1 ? "none" : `translateY(${((1 - amount) * y).toFixed(2)}px)`;
      });
    });
  }, [text, mode, delay, stagger, duration, blur, y, once]);
  return createElement(
    as,
    { ...props, ref, className: `text-reveal${className ? ` ${className}` : ""}`, "data-text-reveal": "", "data-reveal-ready": "false" },
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: text }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: words.map((word, wordIndex) => /^\s*$/.test(word) ? word : /* @__PURE__ */ jsx("span", { className: "text-reveal__word", children: (mode === "word" ? [word] : Array.from(word)).map((unit, index) => /* @__PURE__ */ jsx("span", { className: "text-reveal__unit", children: unit }, index)) }, wordIndex)) })
  );
}
function DomainParallax({ domains: domains2 }) {
  const sectionRef = useRef(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cleanups = Array.from(section.querySelectorAll(".dp-panel__inner")).map((surface) => {
      let previous = "";
      return observeScroll(surface.parentElement, ({ top, viewport, reduced }) => {
        if (section.dataset.motion !== String(!reduced)) section.dataset.motion = String(!reduced);
        const progress = reduced ? 1 : clampProgress((viewport - top) / (viewport * 0.14));
        const lift = matchMedia("(max-width: 760px)").matches ? 20 : 38;
        const key = `${progress}:${lift}`;
        if (previous === key) return;
        previous = key;
        surface.style.opacity = String(progress);
        surface.style.transform = `translateY(${(1 - progress) * lift}px) scale(${0.94 + 0.06 * progress})`;
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
  return /* @__PURE__ */ jsx("section", { className: "dp-section", ref: sectionRef, id: "domains", "aria-labelledby": "domains-title", children: /* @__PURE__ */ jsxs("div", { className: "dp-sticky", children: [
    /* @__PURE__ */ jsxs("div", { className: "dp-header", children: [
      /* @__PURE__ */ jsx(TextReveal, { as: "p", className: "dp-eyebrow", text: "Our Domains", blur: "4px" }),
      /* @__PURE__ */ jsxs("h2", { className: "dp-title", id: "domains-title", "aria-label": "Three paths. Infinite directions.", children: [
        /* @__PURE__ */ jsx(TextReveal, { className: "dp-line-1", text: "THREE PATHS." }),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(TextReveal, { className: "dp-title-teal dp-line-2", text: "INFINITE DIRECTIONS.", delay: 0.12 })
      ] })
    ] }),
    domains2.map((domain) => /* @__PURE__ */ jsx("div", { className: "dp-panel", role: "region", "aria-label": `${domain.title} detail`, children: /* @__PURE__ */ jsxs("div", { className: "dp-panel__inner", children: [
      /* @__PURE__ */ jsxs("div", { className: "dp-panel__head", children: [
        /* @__PURE__ */ jsx("div", { className: "dp-panel__icon-wrap", children: /* @__PURE__ */ jsx(domain.icon, { size: 28, strokeWidth: 2 }) }),
        /* @__PURE__ */ jsxs("div", { className: "dp-panel__heading", children: [
          /* @__PURE__ */ jsxs("span", { className: "dp-panel__num", children: [
            "/",
            domain.num
          ] }),
          /* @__PURE__ */ jsx(TextReveal, { as: "h2", className: "dp-panel__title", text: domain.title, mode: "word", blur: "4px" }),
          /* @__PURE__ */ jsx(TextReveal, { as: "p", className: "dp-panel__subtitle", text: domain.subtitle, mode: "word", blur: "4px" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TextReveal, { as: "p", className: "dp-panel__desc", text: domain.description, mode: "word", blur: "4px" }),
      /* @__PURE__ */ jsx("div", { className: "dp-panel__tags", children: domain.tags.map((tag) => /* @__PURE__ */ jsx("span", { className: "dp-panel__tag", children: tag }, tag)) }),
      /* @__PURE__ */ jsxs("div", { className: "dp-panel__actions", children: [
        /* @__PURE__ */ jsxs("button", { className: "dp-panel__button dp-panel__button--explore", onClick: domain.onClick, children: [
          /* @__PURE__ */ jsx(TextReveal, { text: "Explore domain", blur: "4px", y: 6 }),
          " ",
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 })
        ] }),
        domain.whatsappUrl && /* @__PURE__ */ jsxs("a", { className: "dp-panel__button dp-panel__button--whatsapp", href: domain.whatsappUrl, target: "_blank", rel: "noopener noreferrer", children: [
          /* @__PURE__ */ jsx(MessageCircle, { size: 18 }),
          /* @__PURE__ */ jsx(TextReveal, { text: "Join WhatsApp Community", mode: "word", blur: "4px", y: 6 })
        ] })
      ] })
    ] }) }, domain.id))
  ] }) });
}
const variants = {
  "/team_images/core/Poorvik.avif": { "small": "/team_images/banner/Poorvik-480.webp", "large": "/team_images/banner/Poorvik-800.webp", "preview": "data:image/webp;base64,UklGRl4BAABXRUJQVlA4IFIBAACQBwCdASoeACgAPwFqrk+rJaQiKqwBYCAJagDDczOTowgXzcMsSrVgK4c7z9hPEoMQaZfeHUv5GpFHH2ZNMXZTBIoz1gAA/uYoYn+VmFJ0tQXQ/CN9x5ar/3R/w0+XQlOGygF5Aud3/R9LvrG7B00SM5YoymX+nIFDAg+bAn3zIbfBQDiUaaX3lBrpXmvADbHAn1ZiFs6F4YEiPTFpVkbcuYSNRsFgAA+19fuJRUnqlQh2cMa1pkJNz9q4s5w5uI4QOa5Tyoc6WhK2whYh/WM4a5p3o/p5OnYOUn8vhfYomSENG6GvfAYlRn80BoaBwUhMV3fG6a+ZuLTaejaDlwlliclc+i2Fy4qphjYETlj4hMz7tVG7YtPS3YMrP+WL/fejyr3vhl7mKSWbSMHJcMm1D7wZuRwLHMQ2MW/DNMRqINBcoLjd68CGnqVo/A1nuXoAAA==" },
  "/team_images/core/Dinol.avif": { "small": "/team_images/banner/Dinol-480.webp", "large": "/team_images/banner/Dinol-800.webp", "preview": "data:image/webp;base64,UklGRnYBAABXRUJQVlA4IGoBAABwCACdASoeACgAPu1kp06ppaOiNUgBMB2JQBjfXgastpua6g6eC6tUYbmthuN1GJBtpXcVyaWuMD32SToFTBSij8rHq++DrOU53geAAP6Bm3/1Igf5eXmgSAEVw2wkTHqGcIXnsmTI79e3UxPb3uj0fhOefDmSKf8HGE4dSZRCx/JroHMDNwviD/3RsqtfywYiISeIlEpmra1iWxV7H7PzNkcfZO/DI3E9FoiJV7sSDJ9AzRdtFCBi4lfjSh7aZAtNm/R2ldIoul+ljo4P1vNqbJ8BUCal84TkEzGIcUL2CV7cwBMCWtXhpZNcLtgx7Ttd9QfkZLrIaF9xkgS7BJMOlk7dKWrwtpPlmpeCw2rTZRPF1RLKpx1/MkxO66EyFjtuQ4FLo9oKW3E8JVWQ3dwD6h7r1Uk4wOUHHtbiMXAt+VdFOJcHFDy1bT9YLE+fKX4ofTiIOCbyL1PsUepXxrkwVSg/NgPYCbAAAA==" },
  "/team_images/core/Joylin.avif": { "small": "/team_images/banner/Joylin-480.webp", "large": "/team_images/banner/Joylin-800.webp", "preview": "data:image/webp;base64,UklGRowBAABXRUJQVlA4IIABAACQCACdASodACgAPwFqq08rJiOiMBqqqWAgCUAX7XAlKZmfViOniZ61grKRh5YvjuEXK0rtnHA+uAeIU+1tN1oflqDzHKWJTSRu4KE7gAD+u2THjtkbMnJ5pSEQPrrDwrJK/HRDkCKn2Gyn7a3SPhbVvncboO853p3Yl0IbYPRcQit41855ml80q9OxL4ZYrMegmNLYLe4xhdrQHo1d0ztFG/ISy+X3AIEJU62v4DbSZVQbRXBzTKmoaK9JBVlac6HSSP7TV3Z2bY2+x0jwPJPU2WqvFHgnZr3IuYNtb60MyP3i4emUalgWDVtb8kT2veTUXMRdXr0Qnfclkw7jr9TynBZjMXiULQPh5ULzdfiLSq/2qzSzo/hWVhKtpTKIpSLzFPOSGLyfG2G5eNzHlkzGIm4rRsQkl/nNy5yFr6XQKq5450SGnc4BulmkDNDx2F3EvrAAzFc4spVlvzTdCxQ9bn0eBDsinmKidtr69y7jDQdM0+ltFGiFIwhFj/esAAA=" },
  "/team_images/core/Nishanth1.avif": { "small": "/team_images/banner/Nishanth1-480.webp", "large": "/team_images/banner/Nishanth1-800.webp", "preview": "data:image/webp;base64,UklGRpwBAABXRUJQVlA4IJABAADQCACdASoeACgAPwFssFArJaSisBVaqWAgCUAWI/ZR/0WL9+mLFi9bJxcTnbTK/pNBWHc4GT0tLc7Xo7jmIvSrqcI27JbqYiChbVuY2n1AAP7OjqGULIOBM7sDpv81dr/T4urDsQfvNId4gp8980XDgx+LjfteTF2aBiFqOIYCqog3A1pcW3IOKnw+t6spxTLu2ByYjIP2ZWiRunghvRZHaADyGRvRM7ja+zn7SWlqc+oXHEKOxMNrho/NGOrN1EozmidSkFK8e4jtBLCuSCr1oU1hlrGqIUwKlafauP7SHmXEadzR2aqWyih0BpO/zJIu0UfplWjwf0vhP+ce8f3CUubqOAk+E8NzHRgAF6d56PIwM+4I1IGqoyrxTEy4XmnZMj7VU9LrbOjtJjaSuIWnmXmCxq6uKHTduESt99JVUqoKgf4SLrw6S5kBAqJMYBy/RWtIV/BuZCL+hcsRP+R3pS7dV94yzWg2Y9WM/C85RD2GH8dIGOlBiyR0nl69AIARl1HFADaSITQwjxEsSAAA" },
  "/team_images/core/Karthik.avif": { "small": "/team_images/banner/Karthik-480.webp", "large": "/team_images/banner/Karthik-800.webp", "preview": "data:image/webp;base64,UklGRpABAABXRUJQVlA4IIQBAABQCACdASodACgAPwFqrE8rJaQiNVQIAWAgCWQAnTK+aRzOvlGymnAhLNcizBMVsoeR091iiUyHjz5E0sQlswWMznZ4i+OZZnYk4aAA9ih2oegkr5/L7OL3cBfGPyTkR89II4Y/ef6H5kFKR7PgI3I4eaaeoKEBQxv6N/yYH+sCwJr094MAfrFVKLAcQ7xbS6e9iPk53XNtp4YuPjEqDr/XjzrMrIUnWjb4rZKc7dlDtM/PKdNznWDKonQK0CiwOWVUB/7IyIOMntfgU+sRqGTy8G9b0Mcd0W3grCtDoYuX+nqYjdgvk7k5gwSfs5iDXg3H51B4sbH/7dp3RXar+QZszQCFNvb72ZXeA0XVtIYvKOVmgZK4pfrd3bN3DbSY543N59fs3tDhYOzQygoBxeI0ffTFIj2DusYoISlvpyi4UEbk7yLtzA3vllp6liJPK08PWu2k4PpnIKk9foWkHv3dc98UWrbi+hkAw64woF3rMf5M99qBvocRtz34J+Qv2QnfAAAA" },
  "/team_images/core/Prajwal.avif": { "small": "/team_images/banner/Prajwal-480.webp", "large": "/team_images/banner/Prajwal-800.webp", "preview": "data:image/webp;base64,UklGRmoBAABXRUJQVlA4IF4BAADQBwCdASoaACgAPwFwrlErJiQiqqoBYCAJQBf23mT8O4XpX2kQ+2w31LJ6x8Fy2l+O9qcZbg8OKWHw0CzbbjBkuK2bTZtAAAD+QJbp8unr3VfR1PdUQFQeO+PXtmsGNQwBON41KCx6J8A5vWlpHhuNT2+xP3VsxMUiCnB9NmmnabBU94JpUhVznk21AiFqfLCb33ASFpDhYA3FMYkIfNS/0GgLUPPkzSg/65sL5D1IrifN+PE2CpDKd7Ylte+a2hC61wtfoatIAFv/sVfvvUudWbf9K8Kb0FV1yfofpFD8MWXEr+pdtlUct5Yx0fN1NLXw8ed+NyfRyleojXeFVY58o4Byk8FIr/OsRQZXeKxc7fyOIk78yLtnXy2PcVVPfgu8NTcJxobe8ilu3sxaVDwn+spZx3k8o4FLMREtVWNUcAgwWBV8/s+oQ3x1lGPdkMMCsRXXVrDtoPNEEVwAAA==" },
  "/team_images/core/Mohit.avif": { "small": "/team_images/banner/Mohit-480.webp", "large": "/team_images/banner/Mohit-800.webp", "preview": "data:image/webp;base64,UklGRnwBAABXRUJQVlA4IHABAAAwCACdASoeACgAPvFoqE6ppiOiNVv4ATAeCWIAvk7zNZ2QuvjjFRJRBDO7K11yJOzC6CmgZ7/D//UQB8ljp/i7iYevwn6VjBUqIAD9I5wAziLdzqu1yGzY78LuhtiPXGV9EV6PRvVCJctaz2rKKBW2naVfp6GxTqmmfp7xQJ0tjXtoQd21PdHqjG8QMTCL3KwgMJqe/yqGz5TQPumm5Fq84IGRUmTG6KWXav/KGnnoRaHIIZF99qCyROTQtTfHrWXLeWa99Bsro5CUfp6xOGvfHe+ManH8rmqZUuf7tkbSeIsl4ma7WLDp80k0t3CptMLcOMRz6GcpqIesDgIdkImEogNrId0p7Pu5OYkiAb86N1xq0yPOv3zSy38/TSRTUZNPxrY+0NbwvJG7SsOH0vl5mItVj1swsTjhIedRm3qLZ/iPhDSX683OCXOqr8btE/0l7v8CmzR/Uckwtz9TKeO6md1vS/1v0NytY4fJjgAAAA==" },
  "/team_images/core/Rakshith.avif": { "small": "/team_images/banner/Rakshith-480.webp", "large": "/team_images/banner/Rakshith-800.webp", "preview": "data:image/webp;base64,UklGRqoBAABXRUJQVlA4IJ4BAACwCACdASobACgAPwFsrlArJaQisBVaqWAgCWIAp0eUKUzO8pqcp506QGliaPGnDJLJWlYUmgnB6jCMu6ZCH42V0qmUCDmpPH3RnS1PPgAA/tsj8ow5FDoFMAg+X3qg4iam649C7F0aQKwa7PTG0B+vKuR+tsce6rtWCbKSKbTISfh6+f3ufykt1Swrja0hCLgaOWdonzyp0eF4VCm/4LH/oFDbPl5fQiTpUY30lQBelYDhgvH80cBrFqNdxEryLwYqKnWfFCDm7N9FCCp8GDwNaNvxwlX1hnLhUcUf+330niVhXu6XU2x9nrgS0CcyMiIuQBm5H80qq+nMRdEakaSt17kuxAYvnkcv1DSS+3ZAkeDs4ptoqVA5MYUsnx1+LFlmgc5EYNlRBROD8pDwfPmbIC/CGG7TCG9IRoEJQxYabws1srp5lzwX+d2lXmol9x9f7P6wvQddvTkt3mCRLhRJoCrYc0xJzqvpqvY59vLnlmnzO+caR+KwjYxi0X2KHul6rW74mwe6EXeV2HKwYAz0NbVTzo19rufIF1AAAAA=" },
  "/team_images/core/Navya.avif": { "small": "/team_images/banner/Navya-480.webp", "large": "/team_images/banner/Navya-800.webp", "preview": "data:image/webp;base64,UklGRqIBAABXRUJQVlA4IJYBAAAwCQCdASobACgAPwFwq1GrJiOiqqoBYCAJZgDE81HtttmrN14zq4VfNZZe/MuvHrSgWlk1n2tHeg5gq20+pGLzHjZrjs6YwSFxYTS8SvvrgBEAAP2YSS+PGLQ0Ly5ZFACiJzlj2ovRWI3lOR/xUr/CO6VOjOfOnP2h1S8tPaDP22AZNBUAjTpHHzPCyslp4WCjj0+nhZ5XtbFZHMGO/Jksj2GRReyQYSR/Zrb+u3uu+IUWEkjqsEaBi4te/pVg6t70rr0KGGXpXOlPFtVf0gr6uyo2leEpRZNc4ZQCUZy5uTK6M9BEYUBeIoXkdYvscK+5BQ1SZCh/gGzdekbLumQ/XXZSibaePSmjw5RVlVvBxlB99xKNlcYy/qeQZbVUmqkf47azsTVWP29A2UqR2XXZOXWNOCvCO5nFvi88kY1ZZJfJz/MoldwVTGg4l5Pjdm603QqgJjLO91nLeLBn0zaUlobWJ4uSz0ceAPe2x34LI61RK4zVa3iTSzijFz0MsX9oms/pOu7vb+ZLqLg37XlwYU2uAAAA" },
  "/team_images/core/Deona.avif": { "small": "/team_images/banner/Deona-480.webp", "large": "/team_images/banner/Deona-800.webp", "preview": "data:image/webp;base64,UklGRmgBAABXRUJQVlA4IFwBAABQBwCdASodACgAPwFurk+rJqQiKqwBYCAJbAC2+5QHKmAR7wcR6ENee4GQ8A/IIlzAIP20rwQTB98PftOCyOjGcK4AAP6s8lSJV3vNzTeWyZNqT+uNlEIFm1m/ygvK5cKHf2FH2RswJ5xY+oMfTutq2JAiM3ozVkS8dHrlcmGJyptiLDnk65zBCvg64v1iDYNHip5fKlpRCcUSt7j7i2lKCzcJtvMG3F9owTSs+c6lqYadVIfqmyvHYCdOB7trRwsGPgb11gjvlvvWuSADB1V49nCpVzZLctHdI6XLZ03wHNAUXwBvFD3BYJ6DqaRbU+EfPkz0brEmSaYfJc/JLrlVTLwr6HXIgmVtWsPKgAak8hEwfFyX4ZjslD/mdDmLLpGBx3uCxWILx8kHWyXoYz9YPdxrR2UGRLeyCSrldjVHzYPJQa0VUIsUjL6KmGIHiiwS7BAZZEMoe5Z+gAA=" },
  "/team_images/core/Sweeden.avif": { "small": "/team_images/banner/Sweeden-480.webp", "large": "/team_images/banner/Sweeden-800.webp", "preview": "data:image/webp;base64,UklGRmIBAABXRUJQVlA4IFYBAADwBgCdASoaACgAPwF2sVIrJySiqqgBYCAJQBibO7QxjniqyM/3B/HFdWgcsmTG/m3Ed7xYOJT3e1sgx1fFN0FwAPXZ0SSforbeYDMop+1gw+xVNLJaHX4qxQ3qnucHrIRTfuuliNRR30vvxCZ61AWiqKK0RXXsZ42B0jLiCnvYA42a9UfiIwwOR47wSV5GRZZ+caDp1HVCgfPRROj9RGlDh6n3Bv5bL6JA/bZJsGln+8wm9AcrWaPN0reOpPYvAUdtDlI0EsmdjpGQQMFU6pN9yBsj5cd0nLytm0oKwKsc4+ges/D4thcIAmylffM5Ka99G49iqg92k7LoprAYR9B+usVCTwweC88uEXOkCfI2ojuVEPwnDc3Vp8vGnbch85YfT8uKa+FzuZD2foQWGWAHAI4mLtzxGqSptlfiGOpe2Tz1pdtex/r/qabBNDhH7QDe4zWJAAA=" },
  "/team_images/core/Manvitha.avif": { "small": "/team_images/banner/Manvitha-480.webp", "large": "/team_images/banner/Manvitha-800.webp", "preview": "data:image/webp;base64,UklGRpYBAABXRUJQVlA4IIoBAACQBwCdASogACgAPu1gpU6ppaOiNUgBMB2JagDDOvA1d7Va3weQRY893q+tKxUxC4DfDOJm7xwEff+RiL8lJGZ5X3JgSAAA/jR6aeFVMmGgL2VudB5Y9WfBsEIvXkc9jSTzmBpjUobp9rkzLoUMTiPsw+wdWJDC69GKVmQJH7qx6XDvR/uqU9FNFGYAqV1+lhk8uOb7mzuTX0qMlR3wjfC+c85Wq3MbCg1D+2EkRbvXhWU4Pbp4lk8D9p1WP4Vps/83BFhinRi9yT4BXlWNIipw3rO0vM0n0p/PSfPYPBzJ1EbZ9QFeoHeJdhl6cbRXWodaLY8JBsosfQh25dfOW8XsNuI/AjddjrVrI5m7Y5jiQ/oZxMzHfwZhPz5+awgEY7uPcBOJccxyNaAzEMDJtdDb2BCrdEtuvxBQz1rULHkoF4iAaayYH4odqXcALKGsjZ5tQ0HOHTZ/6a72lCH84yT2rtY8/lizFEKEotJk8fqNbLgMkQNTUtW/7hP1d3POJUPPyYO+OK/ku4AA" },
  "/team_images/core/Salim.avif": { "small": "/team_images/banner/Salim-480.webp", "large": "/team_images/banner/Salim-800.webp", "preview": "data:image/webp;base64,UklGRm4BAABXRUJQVlA4IGIBAADwBwCdASocACgAPwFwrk+rJqQiKqwBYCAJYwDE3atlQFx8r58GizSh4agx/+kLjTqdol0x72XCBQkxqDEHC82XtvrcrQOmOgAA/hk5cgOIDau+oCS2Q1hJxWgjhuCx64euPt8PsfTVQ0Goms3SiSSZ+AYy0o+H9mi2+UlMbJakDstrvpD2pvBnFZZLKiA9m5B4yKyjhAN1TIGppY+qN7+wVum4I2HUFGVRTJVkMsLRAPY9Rb2K6GAjD74wthdEB8Pwrr/3jydKsU8pDpXLhbXiQ90aHPlCpmdVPCgirkkVd8Z1MvlkhBjV1J9BEEvrG+4ohkuBpP0MUQRTE6aB0qmWY+0kSLQzKbbl01GtMFJ4a5ll8ocuevyWj6ePlCWhcnduSUCwE5Yk6UmAET51khEBnF+GyD2ZUy40u2yS793ObJh2KeUQ6W0kbLR3P3oaIl1OtSH6vj+DVEG2ywc5JGgAAAA=" },
  "/team_images/core/Nikhitha.avif": { "small": "/team_images/banner/Nikhitha-480.webp", "large": "/team_images/banner/Nikhitha-800.webp", "preview": "data:image/webp;base64,UklGRpoBAABXRUJQVlA4II4BAACQCACdASocACgAPwFutFIrJiUiqrgKAWAgCWwAuw1wByULAZTR10Yxm/J1dZAQNsHJ7+SSeDJlbHFgEsRzGs+wZbWc/5x3h8gCPaM6UAD+3PLv/2BzKmXbNDWWeax3/10UyZQTVwLN7tIVV+ejDgYjJFzgK5FNcvrLb4rnFPPK/yidqe+E9i07ox62OkGlE6t8R+3eix+7AhTj37VYQ4FecpmZHPzu0dQOyxNVNPUXyF7+FXPxxTk+A1ApfNthM34kTc0AhCppPme6r4kmlSVwigqR8t0lsbRJC5HJfQJ2fHa33XEzNfm7Dd8GNXUcuvwF+YOeqlI0Q/DR2sArO+Qe+C7Memu5LXkYJQsv1VqypyizzAZKohsaBL10lBhYBTOrvcyElKOZZjsE54K8gIuH3q/QSn+AHDe8VLFdzbzP4bRXT2PTUOWGDFmNP6I5uPteh8PVxYF/5K4/WR/j/keQvvHjYggA5vJIQsh6IwThKkjf2h1H7ue+ejjR86AL+/rl/f3Nr397N9VFjtngAA==" },
  "/team_images/core/Saniya.avif": { "small": "/team_images/banner/Saniya-480.webp", "large": "/team_images/banner/Saniya-800.webp", "preview": "data:image/webp;base64,UklGRk4BAABXRUJQVlA4IEIBAABwBwCdASogACgAPvVkqE6qpaOiNVv4AVAeiUAYyN5GuMHTlkhFHBYHJKfoEUn7VpBdG1FhHrcUXsFjlbj2zlVYFzglIADgHBY7VLf8ONBElvzcqQP1GAjrLZZY5U/hSmhH0j3ojjgaGcwTvekWjyRX0K8KGgETeqpHlqqDawS3GygiIn0NZSimLpJyFDIlSAN1J2nkdVHLpADwnD+ntlh69XNhmtvxpShIoODcXZj2iUsjaVjUbuCj6VolrZ0ehVoAR0Mz3QaYQ5hY8yd3g8GyRwyJMbyv81ywUFbWlKnHieetZSj0+AY4+Z1bD0JM4FzaMKhebWgQn1LKriDERPMo9ky4xLveg7ky2cHHAJDgca4eVv4tU5x1S2Kb3TlId+spZWDwURkUOt34K7oZ4o5tbsPX31l87MFiYkwXKcFw0oAA" }
};
const ROLE_RANK = {
  president: 0,
  "vice president": 1,
  vp: 1,
  secretary: 2,
  treasurer: 3,
  "plan & strategy lead": 4,
  "technical lead": 5,
  "tech lead": 5,
  "ai & ml lead": 6,
  "development lead": 7,
  "dsa lead": 8,
  "event lead": 9,
  "media lead": 10,
  "discipline head": 11
};
function sortTeamMembers(members) {
  const created = (member) => Date.parse(member.createdAt ?? "") || 0;
  const rank = (role) => {
    const key = role.trim().toLowerCase();
    return ROLE_RANK[key] ?? (/lead|head/.test(key) ? 50 : 100);
  };
  return [...members].sort((a, b) => created(a) - created(b) || rank(a.role) - rank(b.role));
}
const labels = {
  linkedin: "LinkedIn",
  github: "GitHub",
  leetcode: "LeetCode",
  instagram: "Instagram",
  website: "Website"
};
function createTeamProfiles(members) {
  return sortTeamMembers(members).map((member) => {
    const metadata = variants[member.image ?? ""];
    const socials = [];
    for (const platform of Object.keys(labels)) {
      const value = member.socials?.[platform] ?? metadata?.socials?.[platform];
      if (!value) continue;
      if (value === "#") {
        socials.push({ platform, label: labels[platform], url: "#" });
        continue;
      }
      try {
        const url = new URL(value);
        if (url.protocol === "https:") socials.push({ platform, label: labels[platform], url: url.href });
      } catch {
      }
    }
    return {
      ...member,
      cardImage: metadata?.small ?? member.image,
      profileImage: metadata?.large ?? member.image,
      previewImage: metadata?.preview,
      tagline: member.tagline?.trim() || metadata?.tagline?.trim() || "turning coffee into algorithms",
      socials: socials.length ? socials : ["linkedin", "github", "leetcode"].map((platform) => ({ platform, label: labels[platform], url: "#" }))
    };
  });
}
function useReveal(ref, { delay = 0, variant = "rise", stagger = 0, enabled = true, selector = "[data-reveal-item]" } = {}) {
  useEffect(() => {
    const element = ref.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!enabled || !element || media.matches || !("IntersectionObserver" in window) || !element.animate) return;
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const items = stagger > 0 ? Array.from(element.querySelectorAll(selector)) : [];
    const targets = items.length ? items : [element];
    const animations = /* @__PURE__ */ new Map();
    const frames = variant === "pop" ? [
      { opacity: 0, transform: `translateY(${compact ? 20 : 34}px) scale(.94)`, offset: 0, easing: "cubic-bezier(.16,1,.3,1)" },
      { opacity: 1, transform: `translateY(-2px) scale(${compact ? 1.006 : 1.012})`, offset: 0.72, easing: "cubic-bezier(.33,0,.2,1)" },
      { opacity: 1, transform: "translateY(0) scale(1)", offset: 1 }
    ] : variant === "mask" ? [
      { opacity: 0, transform: "translateY(110%) rotate(3deg)", transformOrigin: "0% 100%" },
      { opacity: 1, transform: "translateY(0) rotate(0deg)", transformOrigin: "0% 100%" }
    ] : [
      { opacity: 0, transform: `translateY(${compact ? 16 : 24}px)` },
      { opacity: 1, transform: "translateY(0)" }
    ];
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry, index) => {
        const target = entry.target;
        const animation = animations.get(target);
        animation?.effect?.updateTiming({ delay: Math.max(0, Math.min(delay, 180)) + Math.min(index * stagger, compact ? 140 : 240) });
        animation?.play();
        observer.unobserve(target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -20px 0px" });
    targets.forEach((target) => {
      const animation = target.animate(frames, {
        duration: compact ? 620 : 780,
        easing: variant === "pop" ? "linear" : "cubic-bezier(.16,1,.3,1)",
        fill: "both"
      });
      animation.pause();
      animation.currentTime = 0;
      animation.onfinish = () => {
        animation.cancel();
        animations.delete(target);
      };
      animations.set(target, animation);
      observer.observe(target);
    });
    const clear = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const stop2 = () => {
      if (media.matches) clear();
    };
    const showFocused = (event) => animations.forEach((animation, target) => {
      if (target.contains(event.target)) {
        animation.cancel();
        animations.delete(target);
        observer.unobserve(target);
      }
    });
    element.addEventListener("focusin", showFocused);
    media.addEventListener("change", stop2);
    return () => {
      clear();
      element.removeEventListener("focusin", showFocused);
      media.removeEventListener("change", stop2);
    };
  }, [ref, delay, variant, stagger, enabled, selector]);
}
function Reveal({ children, className = "", delay = 0, variant = "rise", stagger = 0, ...props }) {
  const ref = useRef(null);
  useReveal(ref, { delay, variant, stagger });
  return /* @__PURE__ */ jsx("div", { ...props, ref, className, children });
}
const quotes = [
  {
    memberId: "poorvik",
    body: "What I cannot create, I do not understand.",
    author: "Richard Feynman"
  },
  {
    memberId: "dinol",
    body: "The best way to predict the future is to invent it.",
    author: "Alan Kay"
  },
  {
    memberId: "joylin",
    body: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra"
  },
  {
    memberId: "prajwal",
    body: "Science is what we understand well enough to explain to a computer. Art is everything else we do.",
    author: "Donald Knuth"
  },
  {
    memberId: "rakshith",
    body: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson & Gerald Jay Sussman"
  },
  {
    memberId: "navya",
    body: "The programmer, like the poet, works only slightly removed from pure thought.",
    author: "Fred Brooks"
  }
];
const coreMembers = createTeamProfiles(seed.team);
const firstRow = quotes.flatMap(({ memberId, ...quote }) => {
  const member = coreMembers.find((member2) => member2.id === memberId);
  return member ? [{ member, ...quote }] : [];
});
const secondRow = [...firstRow].reverse();
const ReviewCard = ({ member, body, author }) => {
  return /* @__PURE__ */ jsxs("div", { className: "vm-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "vm-card-header", children: [
      /* @__PURE__ */ jsx("img", { className: "vm-avatar", src: member.cardImage, alt: member.name, width: 48, height: 48, loading: "lazy", decoding: "async" }),
      /* @__PURE__ */ jsxs("div", { className: "vm-meta", children: [
        /* @__PURE__ */ jsx("p", { className: "vm-name", children: member.name }),
        /* @__PURE__ */ jsx("p", { className: "vm-role", children: member.role })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("blockquote", { className: "vm-quote", children: [
      /* @__PURE__ */ jsxs("p", { className: "vm-body", children: [
        "“",
        body,
        "”"
      ] }),
      /* @__PURE__ */ jsxs("footer", { className: "vm-author", children: [
        "— ",
        author
      ] })
    ] })
  ] });
};
function VoicesMarquee() {
  const ref = useRef(null);
  useEffect(() => {
    const section = ref.current;
    const rows = section.querySelectorAll(".vm-marquee-wrapper");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visible = /* @__PURE__ */ new Set();
    const sync = () => rows.forEach((row) => {
      row.dataset.running = String(visible.has(row) && !document.hidden && !media.matches);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      sync();
    });
    rows.forEach((row) => observer.observe(row));
    sync();
    document.addEventListener("visibilitychange", sync);
    media.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      media.removeEventListener("change", sync);
    };
  }, []);
  return /* @__PURE__ */ jsxs("section", { ref, className: "vm-container section-space", "aria-label": "Community voices", children: [
    /* @__PURE__ */ jsx("div", { className: "vm-header", children: /* @__PURE__ */ jsx(TextReveal, { as: "h2", className: "vm-title", text: "THE VOICES OF NUCLEUS" }) }),
    /* @__PURE__ */ jsxs(Reveal, { className: "vm-marquee-wrapper", delay: 70, tabIndex: 0, role: "region", "aria-label": "Community voices, first row", children: [
      /* @__PURE__ */ jsx("div", { className: "vm-marquee-content", children: firstRow.map((review, i) => /* @__PURE__ */ jsx(ReviewCard, { ...review }, `f1-${i}`)) }),
      /* @__PURE__ */ jsx("div", { className: "vm-marquee-content", "aria-hidden": "true", children: firstRow.map((review, i) => /* @__PURE__ */ jsx(ReviewCard, { ...review }, `f2-${i}`)) }),
      /* @__PURE__ */ jsx("div", { className: "vm-fade-left" }),
      /* @__PURE__ */ jsx("div", { className: "vm-fade-right" })
    ] }),
    /* @__PURE__ */ jsxs(Reveal, { className: "vm-marquee-wrapper reverse", delay: 140, tabIndex: 0, role: "region", "aria-label": "Community voices, second row", children: [
      /* @__PURE__ */ jsx("div", { className: "vm-marquee-content", children: secondRow.map((review, i) => /* @__PURE__ */ jsx(ReviewCard, { ...review }, `s1-${i}`)) }),
      /* @__PURE__ */ jsx("div", { className: "vm-marquee-content", "aria-hidden": "true", children: secondRow.map((review, i) => /* @__PURE__ */ jsx(ReviewCard, { ...review }, `s2-${i}`)) }),
      /* @__PURE__ */ jsx("div", { className: "vm-fade-left" }),
      /* @__PURE__ */ jsx("div", { className: "vm-fade-right" })
    ] })
  ] });
}
function CommunityCTA({ isOpen }) {
  return /* @__PURE__ */ jsxs("section", { className: "community-section community-section--reveal", children: [
    /* @__PURE__ */ jsx(TextReveal, { className: "eyebrow", text: "JOIN THE COMMUNITY", blur: "4px" }),
    /* @__PURE__ */ jsxs("h2", { "aria-label": "Learn. Build. Collaborate.", children: [
      /* @__PURE__ */ jsx(TextReveal, { text: "LEARN. BUILD. " }),
      /* @__PURE__ */ jsx(TextReveal, { text: "COLLABORATE. ", delay: 0.12 })
    ] }),
    /* @__PURE__ */ jsx(TextReveal, { as: "p", mode: "word", blur: "4px", stagger: 0.04, text: isOpen ? "Applications are open. We're looking for passionate students who are ready to grow, ship, and lead." : "Applications are currently closed. Check out our latest projects and events to see what we're building." }),
    /* @__PURE__ */ jsxs("div", { className: "community-actions", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/recruitment", className: "button primary", children: [
        /* @__PURE__ */ jsx(TextReveal, { text: "JOIN CLUB", blur: "4px", y: 6 }),
        " ",
        /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/projects", className: "button outline", children: /* @__PURE__ */ jsx(TextReveal, { text: "PROJECTS", blur: "4px", y: 6 }) })
    ] })
  ] });
}
function createCinematicLenis(options = {}) {
  return new Lenis({
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    duration: 0.6,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    ...options
  });
}
function useCinematicScroll(enabled, syncScenes = false, onScroll) {
  const paint = useRef(onScroll);
  paint.current = onScroll;
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("cinematic-page");
    const preference = window.matchMedia("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)");
    let lenis;
    let frame2 = 0, lastTick = 0, animationTime = 0;
    let disposed = false;
    let stopTracking;
    let scrollLimit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const publish = () => paint.current?.(lenis?.scroll ?? window.scrollY, scrollLimit);
    const nativeScroll = () => {
      if (!lenis) publish();
    };
    const measure2 = () => {
      scrollLimit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      publish();
    };
    const resize = new ResizeObserver(measure2);
    resize.observe(document.documentElement);
    if (syncScenes) void import("./assets/scroll-motion-DPyAT8Zo.js").then(({ ScrollTrigger }) => {
      if (disposed) return;
      let savedScroll;
      const remember = () => {
        savedScroll = window.scrollY;
      };
      const restore = () => {
        if (savedScroll === void 0) return;
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(savedScroll, { immediate: true });
        } else window.scrollTo({ top: savedScroll, behavior: "instant" });
        savedScroll = void 0;
        ScrollTrigger.update();
      };
      ScrollTrigger.addEventListener("refreshInit", remember);
      ScrollTrigger.addEventListener("refresh", restore);
      stopTracking = () => {
        ScrollTrigger.removeEventListener("refreshInit", remember);
        ScrollTrigger.removeEventListener("refresh", restore);
      };
    }).catch(() => {
    });
    const destroy = () => {
      cancelAnimationFrame(frame2);
      frame2 = 0;
      lastTick = 0;
      lenis?.stop();
      lenis?.destroy();
      lenis = void 0;
    };
    const tick = (time) => {
      frame2 = 0;
      animationTime += lastTick ? Math.min(250, time - lastTick) : 1e3 / 60;
      lastTick = time;
      lenis?.raf(animationTime);
      if (lenis?.isScrolling) frame2 = requestAnimationFrame(tick);
      else lastTick = 0;
    };
    const wake = () => {
      if (lenis && !frame2 && !document.hidden) frame2 = requestAnimationFrame(tick);
    };
    const sync = () => {
      destroy();
      if (!preference.matches) return;
      lenis = createCinematicLenis();
      lenis.on("scroll", publish);
      animationTime = 0;
      wake();
    };
    const settle = () => lenis?.scrollTo(window.scrollY, { immediate: true });
    const onKeyDown = (event) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) settle();
    };
    const onVisibilityChange = () => {
      cancelAnimationFrame(frame2);
      frame2 = 0;
      lastTick = 0;
      if (document.hidden) settle();
      else wake();
    };
    sync();
    measure2();
    window.addEventListener("scroll", nativeScroll, { passive: true });
    window.addEventListener("resize", measure2, { passive: true });
    preference.addEventListener("change", sync);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", settle);
    window.addEventListener("focusin", settle);
    window.addEventListener("wheel", wake, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      stopTracking?.();
      resize.disconnect();
      window.removeEventListener("scroll", nativeScroll);
      window.removeEventListener("resize", measure2);
      destroy();
      document.documentElement.classList.remove("cinematic-page");
      preference.removeEventListener("change", sync);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", settle);
      window.removeEventListener("focusin", settle);
      window.removeEventListener("wheel", wake);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, syncScenes]);
}
const pages = {
  "/": { title: "Nucleus SJEC — A connection worth making", description: "The student innovation community at St. Joseph Engineering College, Mangaluru. Explore AI, build for the web, and master algorithms with Nucleus." },
  "/about": { title: "Our domains — Nucleus SJEC", description: "Explore AI and machine learning, web development, and data structures and algorithms. Learn and build with the Nucleus student community at SJEC." },
  "/events": { title: "Events — Nucleus SJEC", description: "Discover Nucleus SJEC workshops and community events. Open our photo books and explore seven stations on the Nucleus Ride." },
  "/news": { title: "Live News — Nucleus SJEC", description: "The latest announcements, upcoming events, and community updates from Nucleus at St. Joseph Engineering College, Mangaluru." },
  "/projects": { title: "Our work — Nucleus SJEC", description: "Explore projects built by the Nucleus student community at SJEC, from useful web applications to AI experiments and collaborative ideas." },
  "/achievements": { title: "Achievements — Nucleus SJEC", description: "Nucleus SJEC member achievements. This preview contains clearly labelled sample results." },
  "/team": { title: "The people — Nucleus SJEC", description: "Meet the students behind Nucleus at St. Joseph Engineering College, Mangaluru. Get to know our team, their roles, and the community they build." },
  "/recruitment": { title: "Join the community — Nucleus SJEC", description: "Connect with Nucleus SJEC and discover opportunities to learn, build projects, and grow with students interested in AI, web development, and algorithms." }
};
function pageMeta(path) {
  const requestedPath = path.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  const pathname = requestedPath === "/live-news" ? "/news" : requestedPath;
  const page = Object.hasOwn(pages, pathname) ? pages[pathname] : void 0;
  const admin = /^\/admin(?:\/|$)/.test(pathname);
  return {
    found: Boolean(page),
    title: page?.title ?? (admin ? "Control room | Nucleus" : "Page not found — Nucleus SJEC"),
    description: page?.description ?? "Explore the Nucleus student community at St. Joseph Engineering College, Mangaluru.",
    canonical: `https://nucleussjec.in${page ? pathname : "/"}`,
    // Illustrative member results remain outside search indexes until real content is supplied.
    robots: page && pathname !== "/achievements" ? "index,follow" : "noindex,nofollow"
  };
}
const domains = [
  { id: "aiml", num: "01", title: "Artificial Intelligence", subtitle: "& Machine Learning", icon: BrainCircuit, whatsappUrl: "https://chat.whatsapp.com/F2sg6LBCwibIKWJu2nhnvI", tags: ["Intelligence", "Research", "Possibility"], description: "Explore machine learning, build models, and turn new questions into experiments.", detail: "Explore model building, machine learning foundations, research papers, and practical AI applications. Bring your curiosity; build your understanding through collaborative experiments." },
  { id: "web", num: "02", title: "Web Development", subtitle: "& Digital Experiences", icon: Code2, whatsappUrl: "https://chat.whatsapp.com/L97jBsJl7vJ6ol1k68Ue9L", tags: ["Design", "Build", "Ship"], description: "Design thoughtful interfaces. Build useful applications. Put your ideas on the web.", detail: "Work across frontend and backend development, UI design, APIs, and deployment. Learn by making useful applications and sharing feedback with other builders." },
  { id: "dsa", num: "03", title: "Data Structures", subtitle: "& Algorithms", icon: Network, whatsappUrl: "https://chat.whatsapp.com/LPTqGQdnGRo24BEZyrk9vy", tags: ["Logic", "Patterns", "Problem-solving"], description: "Find the patterns, solve hard problems, and build a stronger foundation.", detail: "Develop problem-solving habits through data structures, algorithmic thinking, peer practice, and competitive programming. Learn to explain both your solution and why it works." }
];
function ApplyForm({ settings: settings2, onClose }) {
  return /* @__PURE__ */ jsx(Modal, { title: "Recruitment", onClose, children: /* @__PURE__ */ jsx(RecruitmentApplication, { initialSettings: settings2 }) });
}
function SiteFooter({ settings: settings2 }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  useReveal(ref, { enabled: pathname === "/", stagger: 65, selector: ".footer-top > *, .footer-bottom > *" });
  return /* @__PURE__ */ jsxs("footer", { ref, className: "site-footer section-wrap", id: "contact", children: [
    /* @__PURE__ */ jsxs("div", { className: "footer-top", children: [
      /* @__PURE__ */ jsxs(Link, { className: "brand", to: "/", "aria-label": "Nucleus home", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsxs("span", { children: [
          "NUCLEUS",
          /* @__PURE__ */ jsx("small", { children: "SJEC · MANGALURU" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "footer-socials", children: [
        /* @__PURE__ */ jsx("a", { href: settings2.instagramUrl, target: "_blank", rel: "noreferrer", "aria-label": "Nucleus Instagram", children: /* @__PURE__ */ jsx(Instagram, { size: 18 }) }),
        /* @__PURE__ */ jsx("a", { href: settings2.linkedinUrl, target: "_blank", rel: "noreferrer", "aria-label": "Nucleus LinkedIn", children: /* @__PURE__ */ jsx(Linkedin, { size: 18 }) }),
        /* @__PURE__ */ jsx("a", { href: settings2.githubUrl, target: "_blank", rel: "noreferrer", "aria-label": "Nucleus GitHub", children: /* @__PURE__ */ jsx(Github, { size: 18 }) }),
        /* @__PURE__ */ jsx("a", { href: `mailto:${settings2.contactEmail}`, "aria-label": "Email Nucleus", children: /* @__PURE__ */ jsx(Mail, { size: 18 }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "footer-bottom", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Nucleus SJEC"
      ] }),
      /* @__PURE__ */ jsx("span", { children: "Made of many minds." })
    ] })
  ] });
}
function App({ initialData = seed, serverRendered = false }) {
  const [data, setData] = useState(initialData);
  const [applyOpen, setApplyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [domain, setDomain] = useState(null);
  const [loadingStage, setLoadingStage] = useState("idle");
  const loading = loadingStage === "loading" || loadingStage === "exiting";
  const location = useLocation();
  const pagePath = location.pathname.replace(/\/+$/, "") || "/";
  const navigationType = useNavigationType();
  useCinematicScroll(location.pathname === "/" && !loading && !applyOpen && !menuOpen && domain === null);
  useEffect(() => {
    const abort = new AbortController();
    let disposed = false, finished = false, finishTimer = 0;
    const started = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minimum = reduced ? 0 : LOADER_MINIMUM_MS;
    setLoadingStage("loading");
    const dismiss = () => {
      if (disposed || finished) return;
      finished = true;
      window.clearTimeout(deadline);
      window.clearTimeout(finishTimer);
      setLoadingStage("exiting");
    };
    const deadline = window.setTimeout(dismiss, LOADER_MAXIMUM_MS);
    const refresh = () => Promise.all([
      api("/site", { signal: abort.signal }).catch(() => initialData),
      supabase.from("team_members").select("id, name, role, photo_url, created_at").order("created_at", { ascending: true }),
      supabase.from("events").select("*, event_photos (id, name, photo_url, position)").order("starts_at", { ascending: true })
    ]).then(([site, { data: teamData, error: teamError }, { data: eventData, error: eventError }]) => {
      if (teamError) console.error("Failed to load team from Supabase", teamError);
      if (eventError) console.error("Failed to load events from Supabase", eventError);
      const team2 = (teamData || []).map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.photo_url ?? void 0,
        createdAt: member.created_at,
        initials: member.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
      }));
      const events2 = (eventData || []).map((ev) => ({
        id: ev.id,
        title: ev.title,
        description: ev.description,
        startsAt: ev.starts_at,
        endsAt: ev.ends_at,
        location: ev.location,
        category: ev.category,
        registrationUrl: ev.registration_url ?? "",
        albumUrl: ev.album_url ?? void 0,
        published: ev.published,
        managed: true,
        photos: (ev.event_photos || []).sort((a, b) => a.position - b.position).map((p) => ({
          id: p.id,
          name: p.name,
          url: p.photo_url
        }))
      }));
      if (!disposed) {
        setData({ ...site, team: team2, events: events2.length > 0 ? events2 : site.events });
      }
    }).catch(() => {
    });
    const firstRequest = refresh();
    void (serverRendered ? Promise.resolve() : firstRequest).then(() => {
      if (!disposed && !finished) finishTimer = window.setTimeout(dismiss, Math.max(0, minimum - (performance.now() - started)));
    });
    window.addEventListener("focus", refresh);
    return () => {
      disposed = true;
      abort.abort();
      window.clearTimeout(deadline);
      window.clearTimeout(finishTimer);
      window.removeEventListener("focus", refresh);
    };
  }, [serverRendered]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setApplyOpen(false);
    setDomain(null);
    const meta = pageMeta(location.pathname);
    document.title = meta.title;
    const setMeta = (attribute, name, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.append(element);
      }
      element.content = content;
    };
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.robots);
    for (const prefix of ["og", "twitter"]) {
      const attribute = prefix === "og" ? "property" : "name";
      setMeta(attribute, `${prefix}:title`, meta.title);
      setMeta(attribute, `${prefix}:description`, meta.description);
    }
    setMeta("property", "og:url", meta.canonical);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = meta.canonical;
  }, [location.pathname]);
  useEffect(() => {
    if (navigationType === "POP") setMenuOpen(false);
  }, [location.key, navigationType]);
  const settings2 = data.settings;
  const domainItems = domains.map((item, index) => ({ ...item, onClick: () => setDomain(index) }));
  const navItems = [
    { title: "Home", href: "/" },
    { title: "Events", href: "/events" },
    { title: "Live News", href: "/news" },
    { title: "Our work", href: "/projects" },
    { title: "Achievements", href: "/achievements" },
    { title: "The people", href: "/team" }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(LoadingScreen, { active: loadingStage === "idle" || loadingStage === "loading", onExitComplete: () => setLoadingStage("done") }),
    /* @__PURE__ */ jsxs("div", { className: `site-shell${["/", "/team"].includes(pagePath) ? " site-shell--home" : pagePath === "/projects" ? " site-shell--work" : pagePath === "/achievements" ? " site-shell--achievements" : ["/news", "/live-news"].includes(pagePath) ? " site-shell--news" : ""}`, inert: loading, "aria-busy": loading, "data-loading-stage": loadingStage, children: [
      ["/", "/achievements", "/news", "/live-news"].includes(pagePath) && /* @__PURE__ */ jsx(BackgroundRippleEffect, { className: "background-ripple-effect--page" }),
      /* @__PURE__ */ jsx("a", { href: "#main-content", className: "skip-link", children: "Skip to content" }),
      /* @__PURE__ */ jsx("header", { className: `site-header${pagePath === "/events" ? " site-header--events" : ["/", "/team"].includes(pagePath) ? " site-header--home" : ""}`, children: /* @__PURE__ */ jsx(MorphingNavbar, { items: navItems, settings: settings2, open: menuOpen, onOpenChange: setMenuOpen, onApply: () => setApplyOpen(true) }) }),
      /* @__PURE__ */ jsx("main", { id: "main-content", tabIndex: -1, inert: menuOpen, children: /* @__PURE__ */ jsx(PageBoundary, { children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "page-loading", role: "status", children: "Opening page…" }), children: /* @__PURE__ */ jsxs(Routes, { children: [
        /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(LogoLanding, { active: loadingStage === "done" }),
          /* @__PURE__ */ jsx(DomainParallax, { domains: domainItems }),
          /* @__PURE__ */ jsx(CommunityCTA, { isOpen: settings2.recruitmentOpen }),
          /* @__PURE__ */ jsx(VoicesMarquee, {})
        ] }) }),
        /* @__PURE__ */ jsx(Route, { path: "/about", element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "about-heading section-wrap", children: [
            /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Nucleus · SJEC" }),
            /* @__PURE__ */ jsxs("h1", { children: [
              "A meeting",
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("em", { children: "of minds." })
            ] })
          ] }),
          /* @__PURE__ */ jsx(DomainParallax, { domains: domainItems })
        ] }) }),
        /* @__PURE__ */ jsx(Route, { path: "/recruitment", element: /* @__PURE__ */ jsx(Recruitment$2, { settings: settings2 }) }),
        /* @__PURE__ */ jsx(Route, { path: "/events", element: /* @__PURE__ */ jsx(EventsPage$2, { events: data.events, onPublished: (event) => setData((current) => ({ ...current, events: [...current.events.filter((item) => item.id !== event.id), event] })) }) }),
        /* @__PURE__ */ jsx(Route, { path: "/projects", element: /* @__PURE__ */ jsx(WorkPage$2, { projects: data.projects, settings: settings2 }) }),
        /* @__PURE__ */ jsx(Route, { path: "/achievements", element: /* @__PURE__ */ jsx(AchievementsPage$2, { members: data.team, settings: settings2 }) }),
        /* @__PURE__ */ jsx(Route, { path: "/news", element: /* @__PURE__ */ jsx(LiveNews$2, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/live-news", element: /* @__PURE__ */ jsx(LiveNews$2, {}) }),
        /* @__PURE__ */ jsx(Route, { path: "/team", element: /* @__PURE__ */ jsx(PeoplePage$2, { members: data.team }) }),
        /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsxs("section", { className: "recruitment-page section-wrap", children: [
          /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "404" }),
          /* @__PURE__ */ jsxs("h1", { children: [
            "Lost the",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("em", { children: "connection?" })
          ] }),
          /* @__PURE__ */ jsxs(Link, { className: "button primary", to: "/", children: [
            "Back to Nucleus ",
            /* @__PURE__ */ jsx(ArrowRight, { size: 17 })
          ] })
        ] }) })
      ] }) }) }, location.pathname) }),
      location.pathname === "/" && /* @__PURE__ */ jsx(SiteFooter, { settings: settings2 }),
      applyOpen && /* @__PURE__ */ jsx(ApplyForm, { settings: settings2, onClose: () => setApplyOpen(false) }),
      domain !== null && /* @__PURE__ */ jsxs(Modal, { title: `${domains[domain].title} ${domains[domain].subtitle}`, onClose: () => setDomain(null), children: [
        /* @__PURE__ */ jsx("p", { className: "modal-lead", children: domains[domain].detail }),
        /* @__PURE__ */ jsx("div", { className: "domain-tags", children: domains[domain].tags.map((tag) => /* @__PURE__ */ jsx("span", { children: tag }, tag)) }),
        /* @__PURE__ */ jsxs("button", { className: "button primary", onClick: () => {
          setDomain(null);
          setApplyOpen(true);
        }, children: [
          "Get involved ",
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 17 })
        ] })
      ] })
    ] })
  ] });
}
const WORKSHOP_STATIONS = [
  { id: "inauguration", title: "Inauguration", folders: ["inauguration"] },
  { id: "dev", title: "Dev", folders: ["dev"] },
  { id: "khoj", title: "Khoj", folders: ["khoj"] },
  { id: "linkedin", title: "LinkedIn", folders: ["linkedin"] },
  { id: "n8n", title: "n8n", folders: ["n8n"] },
  { id: "noesis", title: "Noesis", folders: ["noesis"] },
  { id: "unlocked", title: "Unlocked", folders: ["unlocked"] },
  { id: "coding", title: "Coding", folders: ["coding"] }
];
function workshopStory(title) {
  return `A moment from ${title}. The Nucleus community came together to explore new ideas, learn with one another, and share what they discovered. This chapter collects the people and moments that made the event. A full event recap will be added here.`;
}
function createEventStations(events2) {
  const published = events2.filter((event) => event.published && event.trackPosition === void 0);
  while (published.length < WORKSHOP_STATIONS.length) published.push(null);
  return [...published, ...events2.filter((event) => event.published && event.trackPosition !== void 0)].map((event, index) => ({
    id: event?.id ?? `preview-station-${index}`,
    index,
    number: String(index + 1).padStart(2, "0"),
    name: WORKSHOP_STATIONS[index]?.title ?? event.title,
    workshop: WORKSHOP_STATIONS[index]?.id,
    position: { x: 0, z: 0 },
    radius: 22,
    event
  }));
}
const __vite_glob_0_0 = "/assets/coding1-D4Zfegoo.avif";
const __vite_glob_0_1 = "/assets/coding10-DwYEWR1q.avif";
const __vite_glob_0_2 = "/assets/coding11-CMrFdi28.avif";
const __vite_glob_0_3 = "/assets/coding2-ekMtd2lY.avif";
const __vite_glob_0_4 = "/assets/coding3-D71AOZ4h.avif";
const __vite_glob_0_5 = "/assets/coding4-Bn-kmoJj.avif";
const __vite_glob_0_6 = "/assets/coding5-wcsucOEp.avif";
const __vite_glob_0_7 = "/assets/coding6-HHEYXorl.avif";
const __vite_glob_0_8 = "/assets/coding7-b2AHl7fd.avif";
const __vite_glob_0_9 = "/assets/coding8-_lR_lXAh.avif";
const __vite_glob_0_10 = "/assets/coding9-BxzMd7xm.avif";
const __vite_glob_0_11 = "/assets/d1-CHbGcXHJ.avif";
const __vite_glob_0_12 = "/assets/d2-D7-TL740.avif";
const __vite_glob_0_13 = "/assets/in1-jAOQD5eJ.avif";
const __vite_glob_0_14 = "/assets/in10-DqGbkIiG.avif";
const __vite_glob_0_15 = "/assets/in11-DeSyNl90.avif";
const __vite_glob_0_16 = "/assets/in12-B2feKy7u.avif";
const __vite_glob_0_17 = "/assets/in2-C0DECI0u.avif";
const __vite_glob_0_18 = "/assets/in3-BNgwtR_W.avif";
const __vite_glob_0_19 = "/assets/in4-dGC4HJ7a.avif";
const __vite_glob_0_20 = "/assets/in5-JGlryTdZ.avif";
const __vite_glob_0_21 = "/assets/in6-yfIiN-wZ.avif";
const __vite_glob_0_22 = "/assets/in7-BeNa1J93.avif";
const __vite_glob_0_23 = "/assets/in8-CRckoUeG.avif";
const __vite_glob_0_24 = "/assets/in9-C8edGkoO.avif";
const __vite_glob_0_25 = "/assets/kh1-DO7g2Xz1.avif";
const __vite_glob_0_26 = "/assets/kh2-DNkZTCF9.avif";
const __vite_glob_0_27 = "/assets/kh3-CV0bE9BZ.avif";
const __vite_glob_0_28 = "/assets/kh4-CKD0vXiv.avif";
const __vite_glob_0_29 = "/assets/linkdin1-DcVo1yj7.avif";
const __vite_glob_0_30 = "/assets/linkdin2-CBfVd4WB.avif";
const __vite_glob_0_31 = "/assets/linkdin3-CwsICeQF.avif";
const __vite_glob_0_32 = "/assets/linkdin4-Ouiho71D.avif";
const __vite_glob_0_33 = "/assets/linkdin5-TjxlNSGH.avif";
const __vite_glob_0_34 = "/assets/linkdin6-Bubx7DtR.avif";
const __vite_glob_0_35 = "/assets/linkdin7-CneFINLN.avif";
const __vite_glob_0_36 = "/assets/linkdin8-tjVcQlqe.avif";
const __vite_glob_0_37 = "/assets/linkdin9-Cv9TYY2M.avif";
const __vite_glob_0_38 = "/assets/n8n1-C6-IBFLv.avif";
const __vite_glob_0_39 = "/assets/n8n2-CZBxaGl4.avif";
const __vite_glob_0_40 = "/assets/n8n3-D6tdoWkI.avif";
const __vite_glob_0_41 = "/assets/n8n4-BtJi2J_-.avif";
const __vite_glob_0_42 = "/assets/no1-BRbDB9PB.avif";
const __vite_glob_0_43 = "/assets/no2-BqYFZv2X.avif";
const __vite_glob_0_44 = "/assets/no3-Dk0d-wEm.avif";
const __vite_glob_0_45 = "/assets/no4-C-RYN3RB.avif";
const __vite_glob_0_46 = "/assets/no5-lE6nMCYa.avif";
const __vite_glob_0_47 = "/assets/no6-Dd6VMNMl.avif";
const __vite_glob_0_48 = "/assets/no7-CZHnmTuY.avif";
const __vite_glob_0_49 = "/assets/un1-Bm68214t.avif";
const __vite_glob_0_50 = "/assets/un2-DKtGrrf9.avif";
const __vite_glob_0_51 = "/assets/un3-DfFEm5i6.avif";
const __vite_glob_0_52 = "/assets/un4-BrnTvFcX.avif";
const __vite_glob_0_53 = "/assets/un5-U7h2ph9L.avif";
const __vite_glob_0_54 = "/assets/un6-CMwK91Wi.avif";
function photoNumber(path) {
  const filename = path.split(/[\\/]/).pop().replace(/\.[^.]+$/, "");
  return Number(filename.match(/(?:\((\d+)\)|(\d+))\s*$/)?.slice(1).find(Boolean) ?? Infinity);
}
function workshopPhotos(files2, folders) {
  return Object.entries(files2).filter(([path]) => folders.includes(path.split(/[\\/]/).at(-2).toLowerCase())).sort(([a], [b]) => photoNumber(a) - photoNumber(b) || a.localeCompare(b, void 0, { numeric: true })).map(([path, url]) => ({ id: path, name: path.split(/[\\/]/).pop(), url }));
}
function bookSpreads(photos) {
  const spreads = [[null, photos[0] ?? null]];
  for (let index = 1; index < photos.length; index += 2) spreads.push([photos[index], photos[index + 1] ?? null]);
  return spreads;
}
const files = /* @__PURE__ */ Object.assign({
  "/workshops/coding/coding1.avif": __vite_glob_0_0,
  "/workshops/coding/coding10.avif": __vite_glob_0_1,
  "/workshops/coding/coding11.avif": __vite_glob_0_2,
  "/workshops/coding/coding2.avif": __vite_glob_0_3,
  "/workshops/coding/coding3.avif": __vite_glob_0_4,
  "/workshops/coding/coding4.avif": __vite_glob_0_5,
  "/workshops/coding/coding5.avif": __vite_glob_0_6,
  "/workshops/coding/coding6.avif": __vite_glob_0_7,
  "/workshops/coding/coding7.avif": __vite_glob_0_8,
  "/workshops/coding/coding8.avif": __vite_glob_0_9,
  "/workshops/coding/coding9.avif": __vite_glob_0_10,
  "/workshops/dev/d1.avif": __vite_glob_0_11,
  "/workshops/dev/d2.avif": __vite_glob_0_12,
  "/workshops/inauguration/in1.avif": __vite_glob_0_13,
  "/workshops/inauguration/in10.avif": __vite_glob_0_14,
  "/workshops/inauguration/in11.avif": __vite_glob_0_15,
  "/workshops/inauguration/in12.avif": __vite_glob_0_16,
  "/workshops/inauguration/in2.avif": __vite_glob_0_17,
  "/workshops/inauguration/in3.avif": __vite_glob_0_18,
  "/workshops/inauguration/in4.avif": __vite_glob_0_19,
  "/workshops/inauguration/in5.avif": __vite_glob_0_20,
  "/workshops/inauguration/in6.avif": __vite_glob_0_21,
  "/workshops/inauguration/in7.avif": __vite_glob_0_22,
  "/workshops/inauguration/in8.avif": __vite_glob_0_23,
  "/workshops/inauguration/in9.avif": __vite_glob_0_24,
  "/workshops/khoj/kh1.avif": __vite_glob_0_25,
  "/workshops/khoj/kh2.avif": __vite_glob_0_26,
  "/workshops/khoj/kh3.avif": __vite_glob_0_27,
  "/workshops/khoj/kh4.avif": __vite_glob_0_28,
  "/workshops/linkedin/linkdin1.avif": __vite_glob_0_29,
  "/workshops/linkedin/linkdin2.avif": __vite_glob_0_30,
  "/workshops/linkedin/linkdin3.avif": __vite_glob_0_31,
  "/workshops/linkedin/linkdin4.avif": __vite_glob_0_32,
  "/workshops/linkedin/linkdin5.avif": __vite_glob_0_33,
  "/workshops/linkedin/linkdin6.avif": __vite_glob_0_34,
  "/workshops/linkedin/linkdin7.avif": __vite_glob_0_35,
  "/workshops/linkedin/linkdin8.avif": __vite_glob_0_36,
  "/workshops/linkedin/linkdin9.avif": __vite_glob_0_37,
  "/workshops/n8n/n8n1.avif": __vite_glob_0_38,
  "/workshops/n8n/n8n2.avif": __vite_glob_0_39,
  "/workshops/n8n/n8n3.avif": __vite_glob_0_40,
  "/workshops/n8n/n8n4.avif": __vite_glob_0_41,
  "/workshops/noesis/no1.avif": __vite_glob_0_42,
  "/workshops/noesis/no2.avif": __vite_glob_0_43,
  "/workshops/noesis/no3.avif": __vite_glob_0_44,
  "/workshops/noesis/no4.avif": __vite_glob_0_45,
  "/workshops/noesis/no5.avif": __vite_glob_0_46,
  "/workshops/noesis/no6.avif": __vite_glob_0_47,
  "/workshops/noesis/no7.avif": __vite_glob_0_48,
  "/workshops/unlocked/un1.avif": __vite_glob_0_49,
  "/workshops/unlocked/un2.avif": __vite_glob_0_50,
  "/workshops/unlocked/un3.avif": __vite_glob_0_51,
  "/workshops/unlocked/un4.avif": __vite_glob_0_52,
  "/workshops/unlocked/un5.avif": __vite_glob_0_53,
  "/workshops/unlocked/un6.avif": __vite_glob_0_54
});
const albums = new Map(WORKSHOP_STATIONS.map((workshop) => [workshop.id, workshopPhotos(files, workshop.folders)]));
function populateWorkshopStation(station) {
  const workshop = WORKSHOP_STATIONS.find((item) => item.id === station.workshop);
  if (!workshop) return station;
  if (station.event?.managed) return { ...station, name: station.event.title, event: {
    ...station.event,
    photos: station.event.photos ?? albums.get(workshop.id) ?? []
  } };
  return { ...station, name: workshop.title, event: {
    id: station.id,
    title: workshop.title,
    description: workshopStory(workshop.title),
    startsAt: "",
    endsAt: "",
    location: "",
    category: "Workshop",
    registrationUrl: "",
    published: true,
    // Keep untouched legacy chapters; dashboard edits take precedence above.
    photos: albums.get(workshop.id) ?? []
  } };
}
function EventArtwork({ variant = 0, className = "" }) {
  const id = useId().replaceAll(":", "");
  const metal = `${id}-metal`, edge = `${id}-edge`, core = `${id}-core`;
  return /* @__PURE__ */ jsxs("svg", { className: `event-sculpture ${className}`, viewBox: "0 0 600 700", fill: "none", "aria-hidden": "true", focusable: "false", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: metal, x1: "-230", y1: "-250", x2: "230", y2: "240", gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#f2fff4" }),
        /* @__PURE__ */ jsx("stop", { offset: ".19", stopColor: "#70978a" }),
        /* @__PURE__ */ jsx("stop", { offset: ".34", stopColor: "#ddf8e6" }),
        /* @__PURE__ */ jsx("stop", { offset: ".5", stopColor: "#233d36" }),
        /* @__PURE__ */ jsx("stop", { offset: ".64", stopColor: "#b5d9c4" }),
        /* @__PURE__ */ jsx("stop", { offset: ".82", stopColor: "#42695c" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#d6f6dd" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: edge, x1: "-170", y1: "-240", x2: "210", y2: "250", gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "white" }),
        /* @__PURE__ */ jsx("stop", { offset: ".5", stopColor: "#c3e5c8", stopOpacity: ".12" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#d7ffe3" })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: core, cx: ".32", cy: ".23", r: ".8", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#effff1" }),
        /* @__PURE__ */ jsx("stop", { offset: ".32", stopColor: "#a1cbb1" }),
        /* @__PURE__ */ jsx("stop", { offset: ".72", stopColor: "#3a6651" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#0b231b" })
      ] })
    ] }),
    variant === 0 ? /* @__PURE__ */ jsxs("g", { transform: "translate(300 350) rotate(-28)", children: [
      [0, 60, 120].map((angle) => /* @__PURE__ */ jsxs("g", { transform: `rotate(${angle})`, children: [
        /* @__PURE__ */ jsx("ellipse", { rx: "213", ry: "86", stroke: "#061811", strokeWidth: "37", transform: "translate(5 8)" }),
        /* @__PURE__ */ jsx("ellipse", { rx: "213", ry: "86", stroke: `url(#${metal})`, strokeWidth: "30" }),
        /* @__PURE__ */ jsx("ellipse", { rx: "213", ry: "86", stroke: `url(#${edge})`, strokeWidth: "1.6", transform: "translate(-8 -10)" })
      ] }, angle)),
      /* @__PURE__ */ jsx("circle", { r: "68", fill: `url(#${core})`, stroke: "#dbffe180" }),
      /* @__PURE__ */ jsx("circle", { cx: "-23", cy: "-25", r: "8", fill: "#ecfff1", opacity: ".7" }),
      /* @__PURE__ */ jsx("circle", { cx: "201", cy: "-60", r: "19", fill: `url(#${core})` })
    ] }) : variant === 1 ? /* @__PURE__ */ jsxs("g", { transform: "translate(300 350) rotate(-15)", children: [
      Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ jsxs("g", { transform: `rotate(${index * 30})`, children: [
        /* @__PURE__ */ jsx("path", { d: "M-29-24 -44-204 Q-43-236-13-246 L9-253 32-38 0 22Z", fill: `url(#${metal})`, stroke: `url(#${edge})`, strokeWidth: "1.5" }),
        /* @__PURE__ */ jsx("path", { d: "M-13-246 9-253 32-38 12-24Z", fill: "#f0fff2", opacity: ".2" })
      ] }, index)),
      /* @__PURE__ */ jsx("circle", { r: "58", fill: `url(#${core})`, stroke: "#d6ffe290" }),
      /* @__PURE__ */ jsx("circle", { r: "23", fill: "#0c2018", stroke: "#accbb7", strokeWidth: "4" })
    ] }) : /* @__PURE__ */ jsx("g", { transform: "translate(300 350) rotate(-24)", children: [105, 40, -25, -90].map((y, index) => /* @__PURE__ */ jsxs("g", { transform: `translate(0 ${y}) rotate(${index * 12 - 18})`, children: [
      /* @__PURE__ */ jsx("path", { d: "M-183-67Q0-177 183-67L183-23Q0 91-183-23Z", fill: `url(#${metal})`, stroke: `url(#${edge})`, strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("ellipse", { rx: "183", ry: "85", cy: "-67", fill: `url(#${core})`, stroke: `url(#${edge})`, strokeWidth: "2" }),
      /* @__PURE__ */ jsx("ellipse", { rx: "115", ry: "49", cy: "-67", fill: "#0c221a", stroke: "#bddfce90", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("path", { d: "M-174-45Q0 60 174-45", stroke: "#e7ffec", strokeOpacity: ".45" })
    ] }, y)) })
  ] });
}
const manifest = {
  "/workshops/coding/coding1.avif": { "images": [{ "url": "/workshop_images/coding-coding1-db507c5e3d-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding1-db507c5e3d-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRtAAAABXRUJQVlA4IMQAAAAwBQCdASogABIAPwFys1GrJqSiqAqpYCAJZQALACwVXFe73qtdByU+o4/oQ5X8vU28AAD+njR9LbMWhTKOYvbFK3erQTws8EysKdFCFkU9J+Em4mKPgUQdfp59bJcui4ZL7dgAGaXkABjoipj5DbQd0ZE8k1AjIgtxTW9VEUixdt4UaXUTQV3OzK3UL52CgOmAMbULMr4KZoTCPqGM3tWHovJcukvu2zpUS3/uFVifhyrfqvqOJZIhpp3E+e5BF64sGAAA" },
  "/workshops/coding/coding10.avif": { "images": [{ "url": "/workshop_images/coding-coding10-e883bc915b-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding10-e883bc915b-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAABwBQCdASogABIAPwFqrE8rJiQiMAgBYCAJYwDOCiAADkGgW0hX43+zVeyAFgaLb3RTqbjYAPnaVSGLDulPH6PsAPYXyQz+cpktyg4kGlu6k+TuiFpdhxwz2rdITW8GR4HNXiW0IWJDI80Ini/GNHQ2Am2bmL9JS0GwMDCshvzR9Plpv4xfMj3l2btOIdCVYHd4VCsujfE2EagFNUFMZmT3ljulOreG5gp3njt2Yy4L+n/fftZl0sNQyCAAAA==" },
  "/workshops/coding/coding11.avif": { "images": [{ "url": "/workshop_images/coding-coding11-7fea709d04-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding11-7fea709d04-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAABwBQCdASogABIAPwForE6rJaQiMAgBYCAJZQDI9Nq/+AZ1XSiyxo7bN/VRjbPGYyZdE3fAAPJi8gKa+qLjVVUjwhYoKtGy3kCWj7YJj9Dee5MY3SG1HBDDtunoKxQXmpwgOHWBlfM9WSLdnRbZLFlscHyEherTnYZWB0WTytcyRTie686Hy0zH+2xpEg1ADhfR93Cj6XR/HBSYpxntqcH5cUDt3YXEqwgd6pa1Rv0z0Q9vT359/8n3nujYaoQhcnQZoMPW2lUMhWpxgIOAAA==" },
  "/workshops/coding/coding2.avif": { "images": [{ "url": "/workshop_images/coding-coding2-3e14ee4176-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding2-3e14ee4176-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAAAQBQCdASoSACAAPwFyrVArJyQisBgIAWAgCWMAt7gIpOiXsuG92fXASLom6QzYwEQAAP3Piibm5F52XDg6ITgHutVOUEggu/joz9sEgTDYE8z+sod9+DcBkrYC1ISFgauoh3o8ymiKqehVcMi7JsF7vkB4mec9rI/YO0FXPSYHBEtHZYfUne8ZzDUQrpMF4jDmmXqQruz8cGGmyzY3g19571Mxh/XAAAA=" },
  "/workshops/coding/coding3.avif": { "images": [{ "url": "/workshop_images/coding-coding3-6855b0c38c-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding3-6855b0c38c-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAAAwBQCdASoSACAAPwF2slOrJySiqAgBYCAJZwDGfq1yDeF7wy1zvxUjk3NepTNgfsqkoAD+qKHQZpOFDGLGFgVUTkISdq7QT09+WRSrhK5ibZFqlQZZLN9rBu3LuzJ8mXa7BO8oLISbBDNQTsTtjnvxG230MfO5lv+7NxHxFaa88gYeDwF++sLr9pBsZeVxlM6tr8dF5qWbBUJUnb88xzeFeHoSbPny1alJxKfd7QAAAA==" },
  "/workshops/coding/coding4.avif": { "images": [{ "url": "/workshop_images/coding-coding4-167bbcda75-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding4-167bbcda75-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRsoAAABXRUJQVlA4IL4AAAAQBQCdASoSACAAPwF2s1OrJySiqAgBYCAJZwDE2FEtgxm5jRii4ctUhdig1H8Wl2QAANTBqv3C2ZxoYXgOkRsHOClHg6TMxbIv5waEeUCIxpR/BjFPE73+crA1nSTF/vvkqy/0qZA5eLMbeLqmSJ7qyP/hYd+xmm0cRaLUQDn6saWdPLrNcYtlSD+5DoFQxlnyl7eySZ8ma7MnzYUCCFUBCr5bslonxIyrI2bXghbIsruoQyQB45SzWbcJMAAA" },
  "/workshops/coding/coding5.avif": { "images": [{ "url": "/workshop_images/coding-coding5-16fc2791af-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding5-16fc2791af-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAAAwBQCdASoSACAAPwF2s1OrJySiqAgBYCAJYwDE+L/Hw2DiwHMbNRdL7zApDJDhTcc5dADxwyb9VWnuCBTsOg9lGPnU3T8XrqrhsoC6IFEZWGkPiDvx5MaoAnttYguaEHC5iyfk5mllsm8BxYu3y47s+Vpxreh1AmTqBDcsfSm3VStwhWGGPlsIHoyhzf6TwSAlGFxtn9DVkJowh+C05w15JsRHdW6JYU7P9S/D2d6wAA==" },
  "/workshops/coding/coding6.avif": { "images": [{ "url": "/workshop_images/coding-coding6-54d1e8b4c6-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding6-54d1e8b4c6-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRsYAAABXRUJQVlA4ILoAAAAwBQCdASoSACAAPwFyslGrJqSiqAqpYCAJZwAAeAwwUjfIGS6i8dA6mFunnFMlDWNFGADxtt1JethfQvOeinjwNTPd/fBAu6+8tOjZhd/t1YavWGgcNS+Q4XSHNubDblZPix8+ZIgkrf4sQDi3ezfskTC1Jf6xpND6KJFvbInjjcX2Ykvg4LS6zjmV1kIzk95JgLizEgQ/qCvT+FXu8lxbT+xI2XEY5Ji2KlBMYgeWVBoqdquZietAAAA=" },
  "/workshops/coding/coding7.avif": { "images": [{ "url": "/workshop_images/coding-coding7-c26705769b-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding7-c26705769b-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRsIAAABXRUJQVlA4ILYAAAAwBQCdASoSACAAPwF2s1OrJySiqAgBYCAJZwDDNEhmYGkbFKHL/yi/m1p6uDU9PhUmqAD90SmOIhywlpHpsXenzf/Rp+L56IICafuTMzzyq4mHcNSP8XQsdleJoFEADHteEK7RHUpmjPE1FvRVGtidw9++5ZD49PPYr9PsXpuVEktX2mg96p0fUqCebhm/+WIrmGtLNU14JXGk7RL1GrEBE6h3ZHXqpJCvLW58dEONJ8H7iHAAAA==" },
  "/workshops/coding/coding8.avif": { "images": [{ "url": "/workshop_images/coding-coding8-9ae38e49a1-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding8-9ae38e49a1-1440.webp", "width": 721 }], "preview": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAABQBACdASoSACAAPwFsrE8rJiQiMAgBYCAJZwDLpAjsrbAM8mfdj8rNKN9kAOjKNI5pSOB3dNaP3jOAyMZu1lWmmU2cOEeZRM1y+5JRQIV4etiSDl5bIBzbN7paKbY1Lur4qaPe3oOrtntvsRPwvK9mYZSzOauRdiSvZJcZ+GepbuUwIRsEbyj6LJT9x9AAAAA=" },
  "/workshops/coding/coding9.avif": { "images": [{ "url": "/workshop_images/coding-coding9-8135ea67f5-640.webp", "width": 640 }, { "url": "/workshop_images/coding-coding9-8135ea67f5-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAACwBACdASogABIAPvVkqE6qpaOiMAwBUB6JZwAAKSgMS1Vpr5WAMrI/bXr8JXSAAP0cGrnzJxA48/a1yORfvy18Bwz21mWXrEVZms8rPvHcT2HX9vzswMWBrb7wKDoy9vSQ9THSfZJyT9+J1SoVAidKHqSjd/XqeQcj/y0UUbcXxiORQ6NCevDqSRG/vFiJfMtZkhW81Nl+70AA" },
  "/workshops/dev/d1.avif": { "images": [{ "url": "/workshop_images/dev-d1-c2c97deed5-640.webp", "width": 640 }, { "url": "/workshop_images/dev-d1-c2c97deed5-1440.webp", "width": 720 }], "preview": "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAAAwBQCdASoSACAAPwFwrFGrJiQiqA1RYCAJYgCsEf/qYtQq9b5na1Ylp5gMl5HeqCGyWADQSrHbEPq+0TJef9fMblrBN39aMcrttYjDRoJv2jSXLdmhzLivlq12+wKlp5Hdls2v1D/VC/ZhtWEQLab8tJJniRu/KyVPxi3+yfRYpIw1XfJlgCQfQMNfO8KfcDJ/FX5nM6N+N8onemJrhI74MNYAdqaolAA=" },
  "/workshops/dev/d2.avif": { "images": [{ "url": "/workshop_images/dev-d2-6b6d58cd4e-640.webp", "width": 640 }, { "url": "/workshop_images/dev-d2-6b6d58cd4e-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAADQBACdASogABIAPwFysFIrJqSiqAqpYCAJZgCw7Ap6CWQL/pRXM6viY+0tcFevAADKo+Z/5taYQ8zL7GuJ1A1osRId55GtwB5yzZW9Enztt8A0OgAAb3NdVZzcWMcorr/nF5TAm8IN2QioSokKj7jzVPjV1NQdsC73kmyX6czRBsdt9cwDpfbEEpf/kT0RI6W/Z0RQ5bGPzOwxXQ0olgAA" },
  "/workshops/inauguration/in1.avif": { "images": [{ "url": "/workshop_images/inauguration-in1-40774d4797-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in1-40774d4797-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRtwAAABXRUJQVlA4INAAAABwBQCdASogABUAPwFwr1CrJiQisBgIAWAgCWMAthcugpzAIJHeQm0HUoQ3s8WgIIMLfocAAP6pqIsKqLlZqF3/30gWVJ5iM5W57YXc3G9XLY4CJVwTX/KnooHXTrk6gBHvt7VwAq8lD6qV7mUq9yK2CN0falRemtrkkv1WM7KaqEDCRNdXGwhyshSz9HpwDHP5s3UyI0A2OnoHwg37tjJx84RL1I5N+Szp5dZ+56kZSVGRWhv2n2sa25joC/FnqYbKiDEbJTWUVfTKofIZYAAA" },
  "/workshops/inauguration/in10.avif": { "images": [{ "url": "/workshop_images/inauguration-in10-68fd28a695-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in10-68fd28a695-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRuIAAABXRUJQVlA4INYAAABQBQCdASogABUAPwFur1ArJiQiqA1RYCAJYgC+SHtf0j1XtrgkQmoRxNxFqVdoe4qoxgAA/vqJEDGFzqCZqrN0LfsgXpxx24uA7un80T3phtb9iYPHSQ3dL/wMbnbIUvwvhPTJfuNCE1Jr1GpLzvQnm2RiA9R2feJGxpb/yuteVRHw8MfHjgNoWb2d3J8O9LXw2u55Uq0shgfH6L1vSOZH/wddv83DDYyY6XfQW7/uhhZ7dgFDi5o6sQsWMAZvuvRP4HSYgI+K96Ptp9p+riqgxU2QWkAA" },
  "/workshops/inauguration/in11.avif": { "images": [{ "url": "/workshop_images/inauguration-in11-f369e3658c-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in11-f369e3658c-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAACwBACdASogABUAPwFwrFErJiQiqA1RYCAJQBWACNPlowFxlMRM3dhfBnQ91WYAAP72ilDe8bT7mimD0y+c1VL8gCcjIHRWmGvX6osBGO04RdA1xVIfFqAW+H+MjE7WBUJbtAeOiTmk0VYNoTHjeSbr4ZVo1Ky5kGj1F70TvlrLoaVVQTj+qk5CtJYQPj6M+WQPNkWZJpSltIz4hwAAAA==" },
  "/workshops/inauguration/in12.avif": { "images": [{ "url": "/workshop_images/inauguration-in12-efc6257242-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in12-efc6257242-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAAAQBQCdASogABUAPwFwr1ArJqQisBgIAWAgCUAToAIgIuZQvaafO1uPmL9yJlULD194AP7r47bXWpuw4+ptDnOCZ52BXUslABnb5EaC7AlKWGQg7ABwjxbrme/LysIsKFlOIwnB5k3D0XCNdIZLXIixbrUCJVlGdUYiwf9zrerFE0DKN1Mj+FfRwz2eFzpoAAA=" },
  "/workshops/inauguration/in2.avif": { "images": [{ "url": "/workshop_images/inauguration-in2-57243333da-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in2-57243333da-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRuIAAABXRUJQVlA4INYAAACQBQCdASogABUAPwFurlCrJiQiqA1RYCAJYgCxJUE7MAYJxo9L3anK5bfjcKxs7b+tuPF8AAD+ZdmRgbAf3WwyGrKW60Q+auw4tM/2C9DG4NjIJppoMxO/QS8dCzmOD0o3QTgowUvuX7X6KkFxqK4ZwbjzJQgnbVNKMnrwZBUk/WlqAzvm5inSjdJhL3FzbD0CeL1w0PTdrxdAjZIAWDX3k3o8nvmR1N5zyFEFfPaYDio8n8SSAtyTLl/kO8V+/c35NMTydqXUAeRFRdmceEHxD8h0AAAA" },
  "/workshops/inauguration/in3.avif": { "images": [{ "url": "/workshop_images/inauguration-in3-860214a1e5-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in3-860214a1e5-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAAAwBQCdASogABUAPwForE6rJaQiMAgBYCAJQBb3O4Aeh/hr6rmRFfSbq46qnM0hJcK2AAD+yArE9Aj4brLsFaxBH1XO85Hv9QsLWyXrKe3Sr5zSjit/aYXPaLRdNmRjhpoPSANgHETuCRfquHzvMDLseKwV9xf6+Hv+dTwT/9roly/7m75Yz4lm0ULBitdyBy1rPoPUoUWB3SP3vZhgxc6iNUI3hgXBmemyR0jhScAdEUXctnlKBSxBYcAAAA==" },
  "/workshops/inauguration/in4.avif": { "images": [{ "url": "/workshop_images/inauguration-in4-351dfe3af1-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in4-351dfe3af1-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRuoAAABXRUJQVlA4IN4AAACQBQCdASogABUAPwFoq06rJaOiMAgBYCAJZQDO7CG7KduaPxo/xmx/dnXVbe4zBbD6aWNNAAD+tf3zuZaHmMvCTeU5yzKYnrZxsHx/aJ4tEuZ6hq2tfGfQOV6c94B82blPVcMKDVmZ/Ek2SodAqDYou3hBjyynTghZXag3kuvC9pOCBglTYlD29QmqAi4HRZ4Fo6F8zUt6TclrY5dgc+pPKFYbqSyIGKMmK0iD5zklxi7tX/pUQNNLGahnzPae3JSmFK+QDcQaqIPcMNbPZY1VWl36Oy0Ki5AQIglwAAA=" },
  "/workshops/inauguration/in5.avif": { "images": [{ "url": "/workshop_images/inauguration-in5-6f759f4a86-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in5-6f759f4a86-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRvQAAABXRUJQVlA4IOgAAADwBQCdASogABUAPwF2sVOrJyQiqAgBYCAJZAC9+IBbllq0HDcr4RaKkL36KExpp9QSx40KKiFRAAD+8BJsLVmrQN4w21Rw2wkcsnNzOb3YB5YbFqfTCooDXm8VBunrA8WZJQHL6GIGuLeYMljjMDkyX8GH7mH5keYthBNjmIobvr7vAFHwPTx2ePNhJ5kdaMm5FK0MijaZFqz6sjSGKxAcSPuRkccevKpWQZfbWcLz+vKc7J3tbY5L27w0BGOLSr50cSZEFmZDQRat/XCW0kHQTbuF5myPLWyfSPo5BUTujrEGfspb1AAA" },
  "/workshops/inauguration/in6.avif": { "images": [{ "url": "/workshop_images/inauguration-in6-77a6fe58f0-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in6-77a6fe58f0-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAADwBQCdASogABUAPwFqqU8rJiOiMBgMAWAgCUAWHbuisQNZtLBJ28cxU4VLiC4gJJgPmJh9eDxhAAD+6nXrmXcX1tXcMb4fI82wsH7ZBMGvXKJ7HJh9tOYnM/Lb5Eiesv5ORjALRPurPH3hALV/vEDsu7PLJuCY69E1DZ/97vrCCHnEqapZbkHNjH8aRugQUFiqpEThwdvln5dLDJRMYstEbvu9ObMBxBA8TAG5tfEZY0Gs42fhVkWcoKt5pnvhF59KNfzlJwCXELqMk8AAAA==" },
  "/workshops/inauguration/in7.avif": { "images": [{ "url": "/workshop_images/inauguration-in7-54b0a89a31-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in7-54b0a89a31-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRvQAAABXRUJQVlA4IOgAAACwBQCdASogABUAPwFyr1CrJyQisBgIAWAgCWUAzNHc+YQCrCf6VdpuHevglS4wBOBoD/IO5QAA+70qfSEgtZKliyyu4izt1GqYBir2kvxFJfmzVx53vj4FBX4cE/2OjRrldtruMOPoANy7SdlB7+VFZKihvgVLZ8CwAFwcOMv1DLfGCKwx08WE7vf7Zrn94wRymnNdjuMs9cMTRfSFm/DsF/DO68zXplQHb2P9aAowlegoH8BdEr0Gg0XA2tm2KwsjxyVHhlX9PvZqqKOvnfgRe2iRzwCAFk2cO6bFF+XTb/14A/KkpgAA" },
  "/workshops/inauguration/in8.avif": { "images": [{ "url": "/workshop_images/inauguration-in8-4e22c6eaf8-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in8-4e22c6eaf8-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRtgAAABXRUJQVlA4IMwAAAAwBQCdASogABUAPwForE6rJiQiMAgBYCAJZwAIFgJsfhvePfpHXfFWokEBWXJl8m3qAAD+zuW4bmYLndN14yMj1HK8/GLpl53oYATIfdlgiRXQ5t7zg+6DtrCZrHolFrsl0zXOL35EuZsdOHOcFvs9f5ZF+KcgNqbmtsaCypFDQH2IgmtgnKmKzT8ZN5k3LGfkFGOtmwaHsh9P5tEYZcVxGAJLZqm+iwsvlqAKQ/VUkjtkwZnb9mT0LYNYsN38rPhW5pNISWZST34AAAA=" },
  "/workshops/inauguration/in9.avif": { "images": [{ "url": "/workshop_images/inauguration-in9-70ed7cfc57-640.webp", "width": 640 }, { "url": "/workshop_images/inauguration-in9-70ed7cfc57-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAABQBACdASogABUAPvlqp06qpiMiMAwBUB8JQBWABgIUDGPlvCGwhJlbiukAAP7sje7+tgxVNu/Dvy7XpQsQnZzRmMSK+mRah697ZNG1IGtEuJZNxhQ74QiSwNPELlGx0fe9BwNs8p7ZBsqDVZjFVgRBEAA=" },
  "/workshops/khoj/kh1.avif": { "images": [{ "url": "/workshop_images/khoj-kh1-e46e83fcd2-640.webp", "width": 640 }, { "url": "/workshop_images/khoj-kh1-e46e83fcd2-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAAAQBQCdASogABgAPwFmqk6rJSOiMAgBYCAJZgCsAd0YzACiuN5DmFHA18dLHgSE3/jEAP0k7OuPgzsDDLaA88Ha+lVD8bJE7JlT+kkR6oSzdBlkHsXVPr8OS57mC74wfZZcocZEGLsDjOBLObMBHubIQRK20/+fCy8zHRDPQRndRTPL6V2D6Yb9BCPMExXVlVcLUSB6VxJ+ha57bJuADZqbZAXBD6pGlamTB4bdIHPLaKAmSeLyZvHlttXz8iHz/EPHe481akjh1VdQHm1cAA==" },
  "/workshops/khoj/kh2.avif": { "images": [{ "url": "/workshop_images/khoj-kh2-d9a1f1300f-640.webp", "width": 640 }, { "url": "/workshop_images/khoj-kh2-d9a1f1300f-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRuIAAABXRUJQVlA4INYAAADQBQCdASogABgAPwF0r1IrJqQiqAqpYCAJZQC3uYyMs1VP4xixuA0wHU0Qn8DRbea+tMuLuViAAP7vyS+b367IYUKecw6iUpJUuNqZ5lmXBgtCiqnKqjleu3BKI/ubw8iGcBhLxARzZ115OEsp1+VabhF1STsUiwPWyiEzyxGYKhs9w7K/B38kmGoF9L/EGuuWa2TM911V9qBKz/zqGg/MKZgGk4RCV669ajkXRAW13uRNEKwIuju9k055sH4qfXsCHAJhLs73N6ZRVhyJu4gOO8xkrYAA" },
  "/workshops/khoj/kh3.avif": { "images": [{ "url": "/workshop_images/khoj-kh3-0fc2e2081f-640.webp", "width": 640 }, { "url": "/workshop_images/khoj-kh3-0fc2e2081f-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRu4AAABXRUJQVlA4IOIAAABwBQCdASogABgAPwFwsFCrJqSiqA1RYCAJZQC7AYwmbpAp0wAlOGvgqNSz6PVEiMNYNR6AAP6NUM+7DIcHn0eBJ35iVyhcuyYHvO6uYKZCk4cHSBp90JkgKl+tDC08YMrocKueBZ2slEO0QAc4Vh0ei75YIILzvU+OcbkIhBvif8dVfOBErtJjVqCrXyFesIVz046VqPOskD93d/92I9KUm89Y51DSw5+g5OSRIPtq8u+tWmeQsJEfqFmmJc/xNHKSz/n8mJkOujZbZ1jxK7vw35uTkWe/JjCh5MgETJOLtAAA" },
  "/workshops/khoj/kh4.avif": { "images": [{ "url": "/workshop_images/khoj-kh4-198f67efa5-640.webp", "width": 640 }, { "url": "/workshop_images/khoj-kh4-198f67efa5-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRvAAAABXRUJQVlA4IOQAAADwBQCdASogABgAPwFys1GrJqSiqAqpYCAJYwC/7y67paPXOod2XyD90CHKtPTrH11vaN7I9KRhoAD+84J17jvTOsZKbUuRf4Xj2tPwslyKFlNM4RUWBVyECC7unjv5zzmZfYIiIcCUsFtb1VPFscn/kTHM574L8h+Uj0SggvSPBUXwbdfG1/+LWesrpZhi5qBLZot9sdww8751BglVGLVnrivWXjbA7mdxBJkMARd5cvX3AODvHnQSAyUhvZJN2f6x2hh/PvxtX0Dvfem0lf5vPYu1nht0ukIopWIajsW8iuwgAAA=" },
  "/workshops/linkedin/linkdin1.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin1-16cef93532-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin1-16cef93532-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRgoBAABXRUJQVlA4IP4AAACwBQCdASoYACAAPwF2slOrJyQiqAgBYCAJYwC06dzdgjAJ4O7m0Ij/jnS/hm1x2CG9LtX8pwAA/RxwMKo+tCh3UIjpTgWAw5SEeILVtZIS0Vdp5BFRCT17vuxLSvbyADV/neIvwd/Jh9yTUKbVUi//DSaGi0eMJMFkmbxGULwKnhs97VEbnNGWNVRmWdhnFaONnYsphivFfAwlnSLPq7a4iZEXtDVVjtwWwQP16dtjOHsQKmMHyWvdd75G1dN3wI25QS1n6gVzFArV2fswCRCDP73qfE3rMyzHZAp3cEQyRa7U0rnvbZKYsec+fYs/lQdf1ArdVSWrgVTe4k2AAA==" },
  "/workshops/linkedin/linkdin2.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin2-86b2f30f4a-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin2-86b2f30f4a-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRt4AAABXRUJQVlA4INIAAAAQBgCdASoYACAAPwFwrVErJiQiqA1RYCAJQBbfbSHUKdhXVhz5XZ8PFqQQk0pTgx8AkpwnC+vWjwAA/Hp3SK0S14jyHhJaonA+Z8OogZhdOC0BE/9oT2c1JWD/k11D6btc6qY0uRLiM8xdfePml6fNHWtgIgjV5n6UsA17r4FyiYAtxW9HQETcEkv7rccMb5W9q/P3RwNXYwFlda/3A0xPSyxa+oqi9YMc9KBsWowJ4aS8atNIAGanncc1T1PaPGNFGU8wVqQLmPlp4XUsTnpwAAA=" },
  "/workshops/linkedin/linkdin3.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin3-f45f2f81e7-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin3-f45f2f81e7-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRvQAAABXRUJQVlA4IOgAAADwBQCdASoYACAAPwF2s1OrJySiqAgBYCAJYwC/PAgR4Hvtph70YulOqf02l4wLp2fHN5FW17t/AAD+b22i+vCMCr+Ad/QPrBsq/LT7KIh8JhRlAWKH+44KUfOKFvbMLVfyvIIVJgLMS+KsENay43L7XwKsf7v4QUliCC9y0rvbNaHJuTTD8cq3xyE6pLevns7u2DuxNJVEEZEFhcAHdf7FkbWKCDDrmfQRmEfFPOApamp5Rm3hjc5t+fGrXqk9pqWZzYWF4GGJeUVKMA6itQyBsC6TfMzF5sAGYXu2+lnHshYFPSUmTAAA" },
  "/workshops/linkedin/linkdin4.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin4-410e61b0ab-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin4-410e61b0ab-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRuAAAABXRUJQVlA4INQAAACwBQCdASoYACAAPwFyrlKrJqQiqAqpYCAJQACiZ98+cVN025e2cz5fU/AbCSt2YcJ7Qj9H8oAA/iaQqkc+edC6xJTip5/V/71w7bwq5LKLUXKFxCcv9zdaR7Y6L7VpEdN2r9pwh31OhSh45HWNBqh7A8yRyunm5o/SdFlHowRPUA+IU07CEg/s2dI4LCvT2rxlrMDAr1OPDZQASyfSo6wvux9WkzrwZO6Olg7O8kGxthCj3ntYSKaubOScQjR7l/clv9wB7PcMgNhNDLBZZPgls8AAAA==" },
  "/workshops/linkedin/linkdin5.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin5-5f263278bb-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin5-5f263278bb-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRvYAAABXRUJQVlA4IOoAAACQBQCdASoYACAAPwF2slOrJyQiqAgBYCAJYwC2zbASABwgpO5m3VRkt9PKf4zZ3YE/8ypoAAD9d2aN6P/OSVWPvAzDSzbhLDUZ8Up4ANe0KAUF5if1Medr0bbvRJDFSnZRMa2Iw0aVDfmBl0Fhtbbe+zT9Rq84xE723ItMW5YkU66iOaOsWiiyNHOy1A0cRk/CiyCViYJg163OcUXjHcbLLyG/twUh/Akiq+yKglDezbp5pjYieZWgDz3HMY6ijO5XKV9lNqkNdr+Klc6xtHjWpo/9oS4fuiqAdh4SJu1OVd4UUqolCGI8AAA=" },
  "/workshops/linkedin/linkdin6.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin6-223859b6d4-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin6-223859b6d4-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRuYAAABXRUJQVlA4INoAAAAwBQCdASoYACAAPwFyrVKrJqOiqAqpYCAJZQCnFYzcnJvy6T8/b3l2+5KgmkP9JrXfAAD8XJ1GL3aRRX7c06wM/x77bCdieySwyyZXCZTZ1ysNek98uMub6YQJmMqd0QjZ5FJNPnyxWSin5xC4UPgoG2fPOymBXGvu21/+cE6Ro0nHwyfSeL5ayea9apJmzJh3bSzQDxOjQXOiKpgL9qS6DJg9qILMUVQa+rsV3ISTcu8fzhS7YXApiAYFDr8C8cTrKdiNpT0ZNosjYk07eHQXbyu1BE7gcUqgAA==" },
  "/workshops/linkedin/linkdin7.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin7-179040dcff-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin7-179040dcff-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRhgBAABXRUJQVlA4IAwBAADwBQCdASoYACAAPwF2slOrJySiqAgBYCAJYwC7BvA1ohBXvJiydrohCiuG0FPfnerAO0rPYcnMuADNj7juvPrzSGTwitkJzI6ef0phtSbDTzmKvJ5UVJvlFWUHsv6UIehj20J7pTufFwmqQm6m1U7Xq8duAOUB/XekR88rvKQlbM16v+49iOt2J0A30OK1AhpUo+trnlaV5yMpR563kE9SnQhU3ZAqP/nhaX6Wk3t/B9nGdiqVn5R8teE8T1Ht8l1rgO9S3JHGKQTrk5XYLoeCjnnwuTCtYyepzZ6vwHgfdeADcpXqU0ISAwPY5Po+erP/+5ekdingoCmPaN/F3J95bJMvwWQOSt9EAAAA" },
  "/workshops/linkedin/linkdin8.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin8-cd9c1f6e77-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin8-cd9c1f6e77-1440.webp", "width": 960 }], "preview": "data:image/webp;base64,UklGRgYBAABXRUJQVlA4IPoAAAAQBgCdASoYACAAPwF0rlKrJqOiqAqpYCAJQBYeAQI8D38rkTrXI7igx2n+rloyXanTXT/ck0DMmxAA/Ubh3b8K4cZgcZIIn0Nr9o5/DjRgDXrVqATh4TQLl1eBqndy/VB6/rj4iL/CYKxg4ia4n6S9DasHhFbk8GRPJosunocmTaSMFvpJhMukdhMPddDj0nUXbzGND5jN1kU7F7GzAC+vFd6T39R8gFrZ48crVnBKdzPrDQHfdZ8sTMcTfSAG0eJzpw3KbtmRMdJYe/YgcvSP8sMz+3Vm/tKn6wWJnacgehZuTWnqxihjCdGHlEinL/1M3exA1h803gAA" },
  "/workshops/linkedin/linkdin9.avif": { "images": [{ "url": "/workshop_images/linkedin-linkdin9-d8e7058ff0-640.webp", "width": 640 }, { "url": "/workshop_images/linkedin-linkdin9-d8e7058ff0-1440.webp", "width": 1264 }], "preview": "data:image/webp;base64,UklGRswAAABXRUJQVlA4IMAAAABwBQCdASogACAAPwF2s1QrJySjKAgBYCAJZQCDqHlDHKwsN1m7XAAy/ZNcRn8UUqWk1FdwAP7N/YK0zjPOyabfZooZGMxiHmrqa6Cg1A49QoELMR+EH3vXnSY+BGf35gsz7XOGxziF6Oo5yj9b8JS69Y0tZoSTv7M3VK+WRoLLcK7BfPIMzUeCm+1qcyx+rjoAjLedkEy8JLtL9bxlltbfa2Opydq3GX1xKNwwI5zFJ3ZM4b47xFCiBTVNOg6AAAA=" },
  "/workshops/n8n/n8n1.avif": { "images": [{ "url": "/workshop_images/n8n-n8n1-549cf44e34-640.webp", "width": 640 }, { "url": "/workshop_images/n8n-n8n1-549cf44e34-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRtoAAABXRUJQVlA4IM4AAABQBQCdASogABIAPwFurk8rJqQiMAgBYCAJaABVI/AAPVE5rz6yBdtNDgtrHIlFCRVTAkAA/otOMYewBAraBQO+4dmvKAm9Yay+aIHXSsfT26qonbRz6Dn2/6rJkv/E7THp4pqh5AoXgzCVhHKgGq9apkFYJNROt1yb+DplE9klMHgrpRLFGzdP1/dBndgAEEqHCfURtLh9pfPwvh8B7kMQzXSsjFSXNT7o+PYnp9bvvDX728t+SpklDmDNYMhL29a1xqpQEEd7K0guZAaAAA==" },
  "/workshops/n8n/n8n2.avif": { "images": [{ "url": "/workshop_images/n8n-n8n2-98ea6657de-640.webp", "width": 640 }, { "url": "/workshop_images/n8n-n8n2-98ea6657de-1440.webp", "width": 1280 }], "preview": "data:image/webp;base64,UklGRrwAAABXRUJQVlA4ILAAAAAwBACdASogABIAPwFqrE6rJiQiMAgBYCAJZAAAKcSX275a5h1dOxibfgAA7URF58rxA4RjzMv27vOJZ6PPp+rYWYTSMZb4EE6UInrD2mh9ycw/6G/ZGrfTkikhALVK6ioUR0bdjPe63kN9r6xrkdY1s9XbMtyAiKPmvkbA8+lROSV+QBO4O9p/n7KTraEs7wHThui/HtszeAIAcBz/cr8YkuXSrt+3ROkzXDxKwTgAAA==" },
  "/workshops/n8n/n8n3.avif": { "images": [{ "url": "/workshop_images/n8n-n8n3-6764dcc594-640.webp", "width": 640 }, { "url": "/workshop_images/n8n-n8n3-6764dcc594-1440.webp", "width": 720 }], "preview": "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAADQBACdASoSACAAPwFwsVIrJiSiqAqpYCAJZQCuHDOSWejheZV0HxdpQkqox2AhQAD+M9kxWxfvsZhyLqfKJBT+g037Sbv5P0u7J3qGsIKhd6eAk8222eMkZ+4MLqJkGZJqh32mUiS0wJBK8ejL+wKBJ33Usn2/GV9w1b9NDnAowAASS8ZVbes/gAA=" },
  "/workshops/n8n/n8n4.avif": { "images": [{ "url": "/workshop_images/n8n-n8n4-c9d7b945c3-640.webp", "width": 640 }, { "url": "/workshop_images/n8n-n8n4-c9d7b945c3-1440.webp", "width": 720 }], "preview": "data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAABQBACdASoSACAAPwFsr1ArJaQiqA1RYCAJQBadBwLNe3HlaTs5RJDUj+EAANT4BnZZbShSBCUhlVzdiImWIrh0l0M9+rLT7gqQnYPhifydRJtHepLu0m/b/cnEGB+fnpo3Ft1JUbhRQleG1F9fxCj1aWvM4MsfrNNx0fl5ZsTGa15R5jDNT+7FYm5g5hlrKEQsqKBpAAA=" },
  "/workshops/noesis/no1.avif": { "images": [{ "url": "/workshop_images/noesis-no1-799457562d-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no1-799457562d-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAAAwBQCdASogABIAPwFsrU8rJiQiMAgBYCAJZQDE2CPOnBN/5JGKkW9bbLoFczpbDDUjGAD+wGsbr+fqRDKQJR5EBNBEnZpTCndR3Xv8PVQpIibHKtsXgnFZd1anJcx1inTIFX4UOjVur18zTbVprTk6mWsFrTg/KQSpNnV6I3rLm039zVBK50r38iX31T59oKVRbozpaMD70f7Z4/Wz9LB2mgaTQTjmgAA=" },
  "/workshops/noesis/no2.avif": { "images": [{ "url": "/workshop_images/noesis-no2-19a83d9d22-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no2-19a83d9d22-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRsYAAABXRUJQVlA4ILoAAABwBQCdASogABIAPwFqrE8rJiQiMAgBYCAJYwDKAdwA3D47hBgb7oYuqvAOoe7XUKPRFc3AAPa4FlgHVETTmEA7qlVZiFfiBv/u+m3thfMoyFgKQ8Xul+ec2csafrU6vbhvz1GI5I9D0Bykz1NwfnFFLnrCyQ4CVqa6hYVmCcrmHRPk/v7KHe1Fm3aqvwOX+Z7pPyYfq+z3HmJ6LIh33JcgF1d1RhADqzwVMp5ayTqTUTuqlXS9fUlwAAA=" },
  "/workshops/noesis/no3.avif": { "images": [{ "url": "/workshop_images/noesis-no3-4fb9feaa59-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no3-4fb9feaa59-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRs4AAABXRUJQVlA4IMIAAABQBQCdASogABUAPwFqqU+rJaOiMBgMAWAgCUAYapf4lZMXOcoFkZa2WpdJAF1u3DEvkQAA/t/4xMTlH9xdrHFh88RMLd7CyuQwwqmQau74j5eukbW3LsgL3FkHt6maQSTXyBScDxVDNYZ11OV7tba/ikDLXxIGnV38XILfbc7iMSchczhQ9kfrBafjFXTqgqlmd5Q7bAGRykaNA1Q3Z/GXQKGedwENjorY+pJhqSeg1u2miygXR/eSEJlwZeunsAAAAA==" },
  "/workshops/noesis/no4.avif": { "images": [{ "url": "/workshop_images/noesis-no4-d80cb170aa-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no4-d80cb170aa-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRvgAAABXRUJQVlA4IOwAAAAQBgCdASogABUAPwFqr1ErJaQisBgIAWAgCUAX5zGGDl0l0IthLGjxgq+woGZDI4BkkOtyw8zhjkgA/KxyHFhKhpq2mpMGo8a7xTr9oLqExyCRen1sX2ffl5OjkCtXT71BUTBXfG6dH+/J9vvzadCdXqyk+hZ13TeQYqCuA7uzt8NkFkY3H6cb17mRdFX7FfFR29Atnme9LH1/Sz9qODx/3G645aREkx6dJ3WhwqF3axu4ObQcrhJ64bWF2+VKWTUy9M38oiji3vqznZxeSQTj0Esv3QtnlsVO4kRzv57gjeSksdLigqBxCOgAAA==" },
  "/workshops/noesis/no5.avif": { "images": [{ "url": "/workshop_images/noesis-no5-bb10c09316-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no5-bb10c09316-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRs4AAABXRUJQVlA4IMIAAACQBQCdASogABUAPwFqq06rJiOiMAgBYCAJYgCxHt8CbMiq3umV6rtLDu3HKPdVPVp7FLpGwAD+vZ85KJpDsujqqDGfwwjmnZy/96Oj88mq0+gEORW6bmTnMlBKoI5sELUQ37iKxET2CovmjbVbMNOVZDcVVooopqGT8kf8yoqPb6lS9C4DGFfBIblDsJD2jl9XVh7L0d6qbpZFN0zAAkD+8PRgM3u613ZDtRZKq5mgxEoGmhV1JzYn47739ysqH18AAA==" },
  "/workshops/noesis/no6.avif": { "images": [{ "url": "/workshop_images/noesis-no6-8de855448d-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no6-8de855448d-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRgABAABXRUJQVlA4IPQAAAAQBgCdASogABIAPwFqrE6rJiQiMAgBYCAJYgC1F4BAMxy+Tx5+/eEe5WfpExb54Z3Rx9rO0qmfVYAA/s0D+ePKCe38loSVKFJKWSwFSFQ6EGQlRowPzL1Dv3hjxdnbrurF0EABsvVTuQrSqDrFyhhdLQFRpILaQ0mpenlPjxXjxNUVfqTomyQycjNvjnfJqRZxFB6KA/OIpZYF5NkhXQQo52ApdyaHQHTLIjY/sjwlMi+Pxpgk18ZI3XQakUw3eoGlFkLwfW1Y0RMn+lanJeY3vlE7KqYv9KaP7hcy8uXJzDfebzGE5Io0UIvi8ulAnJA1QAAA" },
  "/workshops/noesis/no7.avif": { "images": [{ "url": "/workshop_images/noesis-no7-4b09f21a75-640.webp", "width": 640 }, { "url": "/workshop_images/noesis-no7-4b09f21a75-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRugAAABXRUJQVlA4INwAAACQBQCdASogABIAPwF0rlArJyQisBgIAWAgCUAWIaQAKI8MtDBNHHXZOrqQpwqdrRbiuxF8cAD+6/8JWIHbOOQXZ3fGAqFUWuMNktz7UzF5H8Q3ZwnwWt/cDAwfLgbFB92oN9IQUuJENvGwHUDwUwPUdpTyr26Z3oALbym8xyeZB8mF7Gkdi+GhP87QaXcUykED8CiLp/IzWnZPcHByI25awe4KL1i5hFKknSKt3EiFBMWcCQq9r91wj78BuiIAoMpgvJIxMNJzGs7/8/EVgjMN6dLQ0nOK63jnXMAA" },
  "/workshops/unlocked/un1.avif": { "images": [{ "url": "/workshop_images/unlocked-un1-71da8663e4-640.webp", "width": 640 }, { "url": "/workshop_images/unlocked-un1-71da8663e4-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRsAAAABXRUJQVlA4ILQAAACQBQCdASogABUAPwFqrE8rJiQiMAgBYCAJZQC84d0Y2L37SDTnDDxsQT7fzm9i0C1ClpUwQAD+zftqdwlFyTRr4P6m0k8xsnnMZoz+rlxUnZ2EubDvYYVy9x/eUgeha804tpINtF3u6SmBpQH9PG6ahA+AsHA14t916tPmGaSqA/4ao3U0G0grjd75Ipj5fgdcOGwbFc2w22OcupmWqMegyCEAjDB/AEcME8DujsgKb9UAAAA=" },
  "/workshops/unlocked/un2.avif": { "images": [{ "url": "/workshop_images/unlocked-un2-bd2efdc9c5-640.webp", "width": 640 }, { "url": "/workshop_images/unlocked-un2-bd2efdc9c5-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRuwAAABXRUJQVlA4IOAAAACQBQCdASogABUAPwF0rlArJyQisBgIAWAgCUAZg7GRaaE/F5dsRtoVa28YUgyfyOC0m2DgAAD2pVuxAgWg+kwx9KNlHHSgokGbnQD8GqCaATyWBnno4ywmTElrQRtsglOyOUV2Z8t0POKW8E7ZvqeVymd1DmHxzyazTFsn8lmVARin9UKISKzhVAbw94XlQ0xteRosMiI49gh/Ze0KYtMMPJnICRQcxRmsQO3tPfA7mT7GmBTrYbiDnpS2hLsFA/FglYADYfjE9KyqNUdb1t0L7lxD/ZbwErAY+dElnuAAAA==" },
  "/workshops/unlocked/un3.avif": { "images": [{ "url": "/workshop_images/unlocked-un3-7adc73d099-640.webp", "width": 640 }, { "url": "/workshop_images/unlocked-un3-7adc73d099-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRsoAAABXRUJQVlA4IL4AAAAQBQCdASogABUAPwFsrU6rJiQiMAgBYCAJZQDO7CLGof7rJi9fEfbzJXYpduamfKZgAM4apmbAjbV0dGx2n6WjaAnhH38iLJGhV28GyJjtutZ1ICg16jCph5UPs0sjY4E3xXMGOjxaI28fPQKEsFBGEvnVTqCVFBpPwrJzaXK5UTNjwPbx7NYxs4WAacmTRtkBQIvWX1UtHxm0tretlHYx7N7NwbL5dJt38lYBenurZKtn5i8dN1lGRKxxAAAA" },
  "/workshops/unlocked/un4.avif": { "images": [{ "url": "/workshop_images/unlocked-un4-b93b0da629-640.webp", "width": 640 }, { "url": "/workshop_images/unlocked-un4-b93b0da629-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRgoBAABXRUJQVlA4IP4AAADwBQCdASogABUAPwFqrE8rJiQiMAgBYCAJQBYeNZ/IDesB+zFh/NXAhCEh2TgNQiH+KP3J+NzkgADP6p/uNKthLQf8+roTzh7/9clMa+z+uV4qjKG58087qsKvmZPBS0TFqLiG4HRsB0ufP3vr3PCOqHCRiew976UAKF6AY8t7PJNCWxygh1ninm95xJRHstkL9Ov3Jrv6tlk4kgC5kVKJtlAG0FKG3n2AnjKw7G1Rb5v/l7p+JmR1e7cKdhkA8nZhmpGdKAAA+gxB9KU9VrvgDb5/5inPMinUjXzySN3ozBNzORh63yAviPLwvF17hFiu7JAnGpB1VPpwnEAAAA==" },
  "/workshops/unlocked/un5.avif": { "images": [{ "url": "/workshop_images/unlocked-un5-bed3855d8b-640.webp", "width": 640 }, { "url": "/workshop_images/unlocked-un5-bed3855d8b-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRggBAABXRUJQVlA4IPwAAACwBQCdASogABUAPwForE6rJaQiMAgBYCAJYgC32SAqdrfUSA+PgLKfPB5mIeJ/l3ToU5O9s4AA/qmVgOy9UbDzx8EhR7I4E0p6UDl54TtOGe/MPiiFcNdqhBzKEekTSMea265dZka7StZAJAcOaSH9kovTMShqTBeOON0r1T6hgNjQVV3XMSTolNfPdam5+zT7sqwGShmvoLg20CeubmN5YaLmIkXXmRrjgdGstXCuc+LMgXaQKKaY3PEeFouZHqGvPrf9KWG/Nx/TNHFwKw619qnZ8v4d5Uf3hg3w0mO8gEQ4vqpJGnkpYQ/qy3QzJWr8WL0AqAZFaAzAAAA=" },
  "/workshops/unlocked/un6.avif": { "images": [{ "url": "/workshop_images/unlocked-un6-f04269bfd0-640.webp", "width": 640 }, { "url": "/workshop_images/unlocked-un6-f04269bfd0-1440.webp", "width": 1440 }], "preview": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAAAQBQCdASogABUAPvlopk6qpiMiMAwBUB8JQBTihDwEGzR4fCw+jnJGYCIfS5L3H28AAP7sAzJHjP8N24hkaUmkkt4EyTS+UTk+p33O/rpZ2VxzpxwF86UltcLTCbmgTNjes6bAP8X4SZuYy3skLtjcJXDesXe3QOTZLzJu2IodHamdOCp4NoC73JP0HCn26XZw3nTlKo5/kFYhDcEarZZL4k23Xgb1M8zUyf2uo+HYr9kDc1lJrP5BJ9aQAA==" }
};
const cache = /* @__PURE__ */ new Map();
function preloadImage({ src, srcSet, sizes: sizes2, priority = "low" }) {
  if (typeof Image === "undefined") return;
  const key = `${srcSet ?? src}|${sizes2 ?? ""}`;
  const existing = cache.get(key);
  if (existing) {
    if (priority === "high") existing.fetchPriority = "high";
    cache.delete(key);
    cache.set(key, existing);
    return;
  }
  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = priority;
  if (sizes2) image.sizes = sizes2;
  if (srcSet) image.srcset = srcSet;
  image.src = src;
  cache.set(key, image);
  void image.decode().catch(() => {
    if (cache.get(key) === image) cache.delete(key);
  });
  while (cache.size > 16) cache.delete(cache.keys().next().value);
}
const sizes = {
  card: "(max-width: 620px) 100vw, (max-width: 900px) 50vw, 440px",
  mobile: "100vw",
  spread: "(max-width: 1540px) 50vw, 770px"
};
function eventImageAttributes(photo, layout) {
  const display = manifest[photo.id];
  return {
    srcSet: display?.images.map((image) => `${image.url} ${image.width}w`).join(", "),
    sizes: display ? sizes[layout] : void 0,
    style: display ? { backgroundImage: `url("${display.preview}")` } : void 0
  };
}
function preloadEventPhotos(photos, layout, urgent = 1) {
  photos.forEach((photo, index) => {
    const { srcSet, sizes: sizes2 } = eventImageAttributes(photo, layout);
    preloadImage({ src: photo.url, srcSet, sizes: sizes2, priority: index < urgent ? "high" : "low" });
  });
}
function eventDate(date) {
  return date && Number.isFinite(Date.parse(date)) ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) : "Date to be added";
}
function EventFlipCard({ event, photo, workshopFolder, number: number2 = "01", onClick }) {
  const cover = photo ?? event.photos?.[0];
  const hasDate = Boolean(event.startsAt && Number.isFinite(Date.parse(event.startsAt)));
  const prepare = () => preloadEventPhotos(event.photos?.slice(0, 4) ?? [], matchMedia("(max-width: 620px)").matches ? "mobile" : "spread");
  return /* @__PURE__ */ jsxs("button", { type: "button", className: "event-card", "data-workshop": workshopFolder, onPointerEnter: prepare, onFocus: prepare, onTouchStart: prepare, onClick, "aria-label": `Open ${event.title} event book`, children: [
    /* @__PURE__ */ jsxs("span", { className: "event-card__image-container", children: [
      cover ? /* @__PURE__ */ jsx("img", { className: "event-card__photo", ...eventImageAttributes(cover, "card"), src: cover.url, alt: "", loading: Number(number2) <= 3 ? "eager" : "lazy", fetchPriority: Number(number2) === 1 ? "high" : "auto", decoding: "async" }) : /* @__PURE__ */ jsx(EventArtwork, { variant: Number(number2) % 3 }),
      /* @__PURE__ */ jsxs("span", { className: "event-card__issue", children: [
        "FIELD NOTES / ",
        number2
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "event-card__view", children: [
        "Open the story ",
        /* @__PURE__ */ jsx(ArrowUpRight, { size: 15 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "event-card__text-content", children: [
      /* @__PURE__ */ jsxs("span", { className: "event-card__category", children: [
        event.category || "Workshop",
        /* @__PURE__ */ jsxs("span", { children: [
          String(event.photos?.length ?? 0).padStart(2, "0"),
          " photographs"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "event-card__title", children: [
        event.title,
        /* @__PURE__ */ jsx(ArrowUpRight, { size: 23 })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "event-card__footer", children: [
        /* @__PURE__ */ jsx("span", { className: "event-card__meta", children: hasDate ? eventDate(event.startsAt) : "From the Nucleus archive" }),
        /* @__PURE__ */ jsx("span", { className: "event-card__index", children: number2 })
      ] })
    ] })
  ] });
}
const BOOK_SCROLL_STEP = 420;
const BOOK_TURN_DURATION = 0.52;
const turnEasing = (t) => 1 - Math.pow(1 - t, 3);
const WHEEL_LERP = 0.14;
const WHEEL_IDLE_MS = 140;
const phase = (value) => `${Math.floor(value)}:${value !== Math.floor(value)}`;
function useBookScroll(wrapper, content, count, singlePage = false, onFrame) {
  const reduced = !!useReducedMotion();
  const [cursor, setCursor] = useState(0);
  const current = useRef(0), navigate = useRef(() => {
  });
  const paint = useRef(onFrame);
  paint.current = onFrame;
  const format = useRef({ singlePage, count });
  const remap = (value) => {
    if (format.current.singlePage !== singlePage) {
      const page = Math.round(value);
      value = singlePage ? page * 2 : Math.floor(page / 2);
    }
    return format.current.singlePage !== singlePage || format.current.count !== count ? Math.min(value, Math.max(0, count - 2)) : value;
  };
  const displayedCursor = remap(cursor);
  useLayoutEffect(() => {
    current.current = remap(current.current);
    format.current = { singlePage, count };
    setCursor(current.current);
    const element = wrapper.current, track = content.current;
    element.style.setProperty("--book-height", `${element.clientHeight}px`);
    const lenis = createCinematicLenis({ wrapper: element, content: track, eventsTarget: document.createElement("div"), autoResize: false, duration: BOOK_TURN_DURATION, easing: turnEasing });
    const clamp = (value) => Math.max(0, Math.min(count - 1, value));
    lenis.scrollTo(clamp(current.current) * BOOK_SCROLL_STEP, { immediate: true });
    let frame2 = 0, last = 0, clock = 0, snapTimer = 0;
    let renderedPhase = phase(current.current), touchPending = false, touchDistance = 1;
    let target = clamp(current.current), anchor = Math.round(target), direction = 0, gesturing = false, touchGesture = false, settling = false;
    let touchY = 0, touchStartY = 0, touchId = null, pulled = false;
    let touchStory = null;
    let reading = false, storyVelocity = 0, touchTime = 0;
    const update = () => {
      const raw = clamp(Number(lenis.scroll) / BOOK_SCROLL_STEP);
      const value = Math.abs(raw - Math.round(raw)) < 1e-4 ? Math.round(raw) : raw;
      current.current = value;
      const next = phase(value);
      if (next !== renderedPhase) {
        renderedPhase = next;
        flushSync(() => setCursor(value));
      }
      paint.current?.(value);
    };
    const flushTouch = () => {
      if (!touchPending) return;
      touchPending = false;
      lenis.scrollTo(target * BOOK_SCROLL_STEP, { immediate: true });
      update();
    };
    const tick = (time) => {
      frame2 = 0;
      const elapsed = last ? Math.min(64, time - last) : 1e3 / 60;
      clock += elapsed;
      last = time;
      if (touchPending) flushTouch();
      lenis.raf(clock);
      if (touchId === null && touchStory && storyVelocity) {
        const before = touchStory.scrollTop;
        touchStory.scrollTop += storyVelocity * elapsed;
        storyVelocity *= Math.exp(-elapsed / 180);
        if (Math.abs(storyVelocity) < 0.02 || touchStory.scrollTop === before) storyVelocity = 0;
      }
      if (lenis.isScrolling || touchPending || storyVelocity && touchId === null) frame2 = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => {
      if (!frame2 && !document.hidden) frame2 = requestAnimationFrame(tick);
    };
    const scroll = (value, duration = BOOK_TURN_DURATION, immediate = reduced, follow = false, easing = turnEasing) => {
      lenis.scrollTo(clamp(value) * BOOK_SCROLL_STEP, { duration, immediate, easing, lerp: follow ? WHEEL_LERP : 0 });
      if (immediate) update();
      wake();
    };
    const go = (page) => {
      clearTimeout(snapTimer);
      gesturing = false;
      touchPending = false;
      settling = false;
      storyVelocity = 0;
      target = clamp(page);
      anchor = Math.round(target);
      const distance = Math.abs(target - current.current);
      scroll(target, Math.max(0.18, BOOK_TURN_DURATION * Math.min(1, distance + 0.25)));
    };
    navigate.current = (delta) => go(Math.round(gesturing ? current.current : target) + delta);
    const settle = () => {
      if (!touchGesture) {
        const velocity = (target - current.current) * 60 * WHEEL_LERP;
        const boundary = Math.round(target);
        target = clamp(Math.abs(target - boundary) < 1e-4 ? boundary : direction > 0 ? Math.ceil(target) : Math.floor(target));
        settling = true;
        const distance = target - current.current;
        const duration = Math.max(0.22, BOOK_TURN_DURATION * Math.min(1, Math.abs(distance) + 0.25));
        const slope = distance ? Math.max(0, Math.min(3, velocity * duration / distance)) : 0;
        scroll(target, duration, reduced, false, (t) => t * t * (3 - 2 * t) + slope * t * (1 - t) * (1 - t));
        return;
      }
      const fraction = target - Math.floor(target);
      const threshold = 0.28;
      const page = direction > 0 && fraction > threshold ? Math.ceil(target) : direction < 0 && fraction < 1 - threshold ? Math.floor(target) : Math.round(target);
      go(page);
    };
    const begin = () => {
      clearTimeout(snapTimer);
      target = current.current;
      anchor = Math.round(target);
      gesturing = true;
      direction = 0;
      settling = false;
      scroll(target, 0, true);
    };
    const pull = (pixels, touch = false) => {
      if (!gesturing) begin();
      touchGesture = touch;
      clearTimeout(snapTimer);
      const nextDirection = Math.sign(pixels);
      if (!nextDirection) return;
      if (!touch && (settling || direction && direction !== nextDirection)) target = current.current;
      settling = false;
      direction = nextDirection;
      const next = target + pixels / BOOK_SCROLL_STEP;
      target = clamp(touch ? Math.max(anchor - 1, Math.min(anchor + 1, next)) : next);
      if (touch) {
        touchPending = true;
        wake();
      } else scroll(target, 0, reduced, true);
    };
    const storyCanScroll = (target2, delta) => {
      const story = target2 instanceof Element ? target2.closest("[data-book-scroll]") : null;
      return !!story && (delta > 0 ? story.scrollTop + story.clientHeight < story.scrollHeight - 2 : story.scrollTop > 2);
    };
    const wheel = (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      if (storyCanScroll(event.target, event.deltaY)) {
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      pull(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1));
      snapTimer = window.setTimeout(settle, WHEEL_IDLE_MS);
    };
    const start = (event) => {
      if (event.pointerType !== "touch") return;
      if (touchId !== null) {
        end();
        return;
      }
      touchId = event.pointerId;
      touchY = touchStartY = event.clientY;
      pulled = false;
      reading = false;
      storyVelocity = 0;
      touchTime = event.timeStamp;
      touchDistance = Math.max(240, element.clientHeight * 0.8);
      touchStory = event.target instanceof Element ? event.target.closest("[data-book-scroll]") : null;
      element.setPointerCapture(event.pointerId);
      begin();
    };
    const move = (event) => {
      if (event.pointerId !== touchId || Math.abs(event.clientY - touchStartY) < 5 && !pulled && !reading) return;
      const delta = touchY - event.clientY;
      touchY = event.clientY;
      event.preventDefault();
      event.stopPropagation();
      if (touchStory && !pulled && (reading || storyCanScroll(touchStory, delta))) {
        reading = true;
        const elapsed = Math.max(8, event.timeStamp - touchTime);
        storyVelocity = Math.max(-2.5, Math.min(2.5, delta / elapsed));
        touchTime = event.timeStamp;
        touchStory.scrollTop += delta;
        return;
      }
      pulled = true;
      pull(delta * BOOK_SCROLL_STEP / touchDistance, true);
    };
    const end = (event) => {
      if (event && event.pointerId !== touchId) return;
      const id = touchId;
      touchId = null;
      if (id !== null && element.hasPointerCapture(id)) element.releasePointerCapture(id);
      flushTouch();
      if (pulled) settle();
      else gesturing = false;
      if (reading && event?.type !== "pointercancel" && !reduced) {
        if (event && event.timeStamp - touchTime > 80) storyVelocity = 0;
        wake();
      } else {
        storyVelocity = 0;
        touchStory = null;
      }
      pulled = false;
      reading = false;
    };
    const lostCapture = (event) => {
      if (event.target === element) end(event);
    };
    const resize = new ResizeObserver(() => {
      element.style.setProperty("--book-height", `${element.clientHeight}px`);
      lenis.resize();
      touchPending = false;
      target = clamp(gesturing ? current.current : target);
      scroll(target, 0, true);
    });
    resize.observe(element);
    resize.observe(track);
    lenis.on("scroll", update);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerdown", start);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", end);
    element.addEventListener("pointercancel", end);
    element.addEventListener("lostpointercapture", lostCapture);
    const visibility = () => {
      cancelAnimationFrame(frame2);
      frame2 = 0;
      last = 0;
      if (!document.hidden) wake();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearTimeout(snapTimer);
      cancelAnimationFrame(frame2);
      resize.disconnect();
      lenis.off("scroll", update);
      lenis.destroy();
      navigate.current = () => {
      };
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointerdown", start);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", end);
      element.removeEventListener("pointercancel", end);
      element.removeEventListener("lostpointercapture", lostCapture);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [wrapper, content, count, reduced, singlePage]);
  const turn = useCallback((delta) => navigate.current(delta), []);
  return { cursor: displayedCursor, current, reduced, turn };
}
function RailwayTrack({ className = "" }) {
  return /* @__PURE__ */ jsxs("span", { className: `railway-track ${className}`, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("span", { className: "railway-track__sleepers" }),
    /* @__PURE__ */ jsx("span", { className: "railway-track__rails" }),
    /* @__PURE__ */ jsx("span", { className: "railway-track__journey", children: /* @__PURE__ */ jsxs("svg", { className: "railway-track__cart", viewBox: "0 0 36 56", fill: "none", children: [
      /* @__PURE__ */ jsx("rect", { x: "1", y: "10", width: "5", height: "11", rx: "2", fill: "var(--surface-raised)", stroke: "var(--muted)" }),
      /* @__PURE__ */ jsx("rect", { x: "30", y: "10", width: "5", height: "11", rx: "2", fill: "var(--surface-raised)", stroke: "var(--muted)" }),
      /* @__PURE__ */ jsx("rect", { x: "1", y: "35", width: "5", height: "11", rx: "2", fill: "var(--surface-raised)", stroke: "var(--muted)" }),
      /* @__PURE__ */ jsx("rect", { x: "30", y: "35", width: "5", height: "11", rx: "2", fill: "var(--surface-raised)", stroke: "var(--muted)" }),
      /* @__PURE__ */ jsx("rect", { x: "7", y: "2", width: "22", height: "52", rx: "8", fill: "var(--mint)", stroke: "var(--surface)", strokeWidth: "2" }),
      /* @__PURE__ */ jsx("path", { d: "M10 12h16l-2 9H12z", fill: "var(--surface-raised)" }),
      /* @__PURE__ */ jsx("rect", { x: "11", y: "24", width: "14", height: "17", rx: "3", fill: "var(--muted)" }),
      /* @__PURE__ */ jsx("path", { d: "M14 27h8m-8 4h8m-8 4h8M13 46h10", stroke: "var(--surface-raised)", strokeWidth: "1.5" }),
      /* @__PURE__ */ jsx("path", { d: "M11 7h3m8 0h3", stroke: "var(--surface)", strokeWidth: "2", strokeLinecap: "round" })
    ] }) })
  ] });
}
const mobileBook = "(max-width: 620px), (max-height: 500px) and (pointer: coarse)";
function Book({ workshopFolder, imageList, event, title, stationNumber = "01", onClose, continueLabel = "Back to Events", galleryOnly = false }) {
  const name = title ?? WORKSHOP_STATIONS.find((item) => item.id === workshopFolder)?.title ?? workshopFolder;
  const [isMobile, setIsMobile] = useState(() => matchMedia(mobileBook).matches);
  const [fitPhoto, setFitPhoto] = useState(true);
  useEffect(() => {
    const media = matchMedia(mobileBook);
    const listener = () => setIsMobile(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  const spreads = useMemo(() => bookSpreads(imageList), [imageList]);
  const count = isMobile ? imageList.length + 1 : spreads.length;
  const dialog = useRef(null), closed = useRef(false);
  const instructions = useId();
  const wrapper = useRef(null), content = useRef(null);
  const book = useRef(null), surface = useRef(null);
  const leaf = useRef(null), progressBar = useRef(null);
  const stripLayers = useRef([]), shadeLayers = useRef([]);
  const storyOffset = useRef(0);
  const strips = isMobile ? 4 : 8;
  useLayoutEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    element.querySelector(".station-book__surface")?.focus({ preventScroll: true });
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  function paint(value) {
    const index = Math.min(count - 1, Math.floor(value));
    const progress2 = Math.min(1, Math.max(0, value - index));
    const shade = Math.sin(progress2 * Math.PI);
    if (book.current) book.current.dataset.bookProgress = value.toFixed(3);
    if (leaf.current) {
      leaf.current.style.setProperty("--book-turn", `${(isMobile ? 180 : -180) * progress2}deg`);
      const bend = `rotate${isMobile ? "X" : "Y"}(${shade * (isMobile ? 2.8 : -1.4)}deg)`;
      stripLayers.current.forEach((layer) => {
        if (layer) layer.style.transform = bend;
      });
      const opacity = String(shade * 0.22);
      shadeLayers.current.forEach((layer) => {
        if (layer) layer.style.opacity = opacity;
      });
    }
    if (surface.current) surface.current.style.opacity = String(1 - (index === count - 1 && !reduced ? progress2 * 0.7 : 0));
    progressBar.current?.style.setProperty("--rail-progress", String(Math.min(1, value / count)));
  }
  const { cursor, current, reduced, turn } = useBookScroll(wrapper, content, count + 1, isMobile, paint);
  useLayoutEffect(() => paint(current.current));
  const page = Math.min(count - 1, Math.floor(cursor));
  const progress = Math.min(1, Math.max(0, cursor - page));
  const turning = progress > 1e-4 && progress < 0.9999;
  const closing = page === count - 1 && turning;
  const showNext = turning && !reduced;
  useEffect(() => {
    if (cursor >= count - 1e-4 && !closed.current) {
      closed.current = true;
      onClose();
    }
  }, [cursor, count, onClose]);
  useEffect(() => {
    const first = isMobile ? Math.max(0, page - 1) : Math.max(0, page * 2 - 1);
    const ahead = isMobile ? 4 : 6;
    const photos = [...imageList.slice(first, first + ahead), ...imageList.slice(Math.max(0, first - 2), first)];
    preloadEventPhotos(photos, isMobile ? "mobile" : "spread", isMobile ? 1 : 2);
  }, [page, spreads, imageList, isMobile]);
  const pages2 = useMemo(() => {
    const story = (duplicate = false) => /* @__PURE__ */ jsxs("section", { className: "station-book__story", "data-book-scroll": true, ref: (element) => {
      if (element) element.scrollTop = storyOffset.current;
    }, onScroll: duplicate ? void 0 : (event2) => {
      storyOffset.current = event2.currentTarget.scrollTop;
    }, tabIndex: duplicate ? -1 : 0, role: duplicate ? void 0 : "region", "aria-label": duplicate ? void 0 : "Event story", children: [
      /* @__PURE__ */ jsxs("span", { className: "station-book__eyebrow", children: [
        event?.category || "Workshop",
        " / Issue ",
        stationNumber
      ] }),
      /* @__PURE__ */ jsx("div", { className: "station-book__title", "aria-hidden": "true", children: name }),
      /* @__PURE__ */ jsxs("div", { className: "station-book__copy", children: [
        /* @__PURE__ */ jsx("p", { children: event?.description || workshopStory(name) }),
        /* @__PURE__ */ jsxs("div", { className: "station-book__details", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(CalendarDays, { size: 14 }),
            eventDate(event?.startsAt)
          ] }),
          event?.location && /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(MapPin, { size: 14 }),
            event.location
          ] })
        ] }),
        !isMobile && /* @__PURE__ */ jsxs("p", { className: "station-book__highlights", children: [
          /* @__PURE__ */ jsx("b", { children: "Key highlights" }),
          /* @__PURE__ */ jsx("br", {}),
          "Ideas shared. Skills explored. Connections made."
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "station-book__byline", children: "Made of many minds. / SJEC" })
    ] });
    const photo = (index, duplicate = false) => {
      const item2 = imageList[index];
      if (!item2) return index === 0 ? /* @__PURE__ */ jsx("figure", { className: "station-book__cover-art nx-event-artwork", children: /* @__PURE__ */ jsx(EventArtwork, { variant: Number(stationNumber) % 3 }) }) : /* @__PURE__ */ jsx("div", { className: "station-book__blank" });
      const image = eventImageAttributes(item2, isMobile ? "mobile" : "spread");
      const backdrop = isMobile ? { "--book-photo-backdrop": image.style?.backgroundImage ?? `url(${JSON.stringify(item2.url)})` } : void 0;
      return /* @__PURE__ */ jsx("figure", { className: !isMobile && index === 0 ? "station-book__cover-art" : "station-book__panel", style: backdrop, children: duplicate ? /* @__PURE__ */ jsx("img", { ...image, src: item2.url, alt: "", decoding: "async", draggable: false }, item2.url) : /* @__PURE__ */ jsx("a", { href: item2.url, target: "_blank", rel: "noreferrer", "aria-label": `Open ${name} photograph ${index + 1}`, children: /* @__PURE__ */ jsx("img", { ...image, src: item2.url, alt: `${name} — photograph ${index + 1}`, fetchPriority: "high", decoding: "async", draggable: false }, item2.url) }) });
    };
    const item = (index, duplicate = false) => index === 0 ? story(duplicate) : photo(index - 1, duplicate);
    const end = /* @__PURE__ */ jsx("div", { className: "station-book__end-cover" });
    const front = isMobile ? item(page, true) : item(page * 2 + 1, true);
    const back = page === count - 1 ? end : isMobile ? /* @__PURE__ */ jsx("div", { className: "station-book__reverse-paper" }) : item(page * 2 + 2, true);
    const strip = (index) => /* @__PURE__ */ jsxs("div", { className: "station-book__strip", ref: (element) => {
      stripLayers.current[index] = element;
    }, style: { "--strip": index, "--reverse-strip": strips - 1 - index }, children: [
      /* @__PURE__ */ jsxs("div", { className: "station-book__leaf-face station-book__leaf-front", children: [
        /* @__PURE__ */ jsx("div", { className: "station-book__slice", children: front }),
        /* @__PURE__ */ jsx("div", { className: "station-book__leaf-shade", ref: (element) => {
          shadeLayers.current[index * 2] = element;
        } })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "station-book__leaf-face station-book__leaf-back", children: [
        /* @__PURE__ */ jsx("div", { className: "station-book__slice", children: back }),
        /* @__PURE__ */ jsx("div", { className: "station-book__leaf-shade", ref: (element) => {
          shadeLayers.current[index * 2 + 1] = element;
        } })
      ] }),
      index < strips - 1 && strip(index + 1)
    ] }, index);
    return {
      spread: (revealNext) => /* @__PURE__ */ jsxs("div", { className: `station-book__spread ${page === 0 ? "station-book__cover" : "station-book__photos"}`, children: [
        !isMobile && /* @__PURE__ */ jsx("div", { className: "station-book__page station-book__page--left", children: item(page * 2) }),
        /* @__PURE__ */ jsx("div", { className: "station-book__page station-book__page--right", children: page === count - 1 && revealNext ? end : isMobile ? item(revealNext ? page + 1 : page) : item(revealNext ? page * 2 + 3 : page * 2 + 1) })
      ] }),
      leaf: strip(0)
    };
  }, [page, count, isMobile, strips, imageList, event, name, stationNumber]);
  const links = [{ url: event?.albumUrl, label: "View photo album" }, { url: event?.registrationUrl, label: "Register for event" }].filter((link) => link.url && /^https?:\/\//i.test(link.url));
  return createPortal(/* @__PURE__ */ jsxs("dialog", { ref: dialog, className: "nx-dialog nx-book-dialog", "aria-label": name, "data-lenis-prevent": true, onCancel: (event2) => {
    event2.preventDefault();
    onClose();
  }, children: [
    /* @__PURE__ */ jsx("button", { className: "nx-close", "aria-label": "Close event", onClick: onClose, children: /* @__PURE__ */ jsx(X, { size: 18 }) }),
    /* @__PURE__ */ jsxs("div", { className: "station-book", ref: book, style: { "--book-strips": strips }, "data-layout": isMobile ? "mobile" : "spread", "data-photo-fit": fitPhoto ? "contain" : "cover", "data-workshop": workshopFolder, "data-station-number": stationNumber, "data-book-page": page + 1, "data-book-turning": turning, "data-book-closing": closing, "data-scroll-engine": "lenis", onKeyDown: (event2) => {
      if (event2.altKey || event2.ctrlKey || event2.metaKey) return;
      const story = event2.target instanceof Element ? event2.target.closest("[data-book-scroll]") : null;
      if (story && (event2.key === "ArrowDown" && story.scrollTop + story.clientHeight < story.scrollHeight - 1 || event2.key === "ArrowUp" && story.scrollTop > 1)) return;
      const delta = ["ArrowRight", "ArrowDown", "PageDown"].includes(event2.key) ? 1 : ["ArrowLeft", "ArrowUp", "PageUp"].includes(event2.key) ? -1 : 0;
      if (delta) {
        event2.preventDefault();
        event2.stopPropagation();
        turn(delta);
      }
    }, children: [
      /* @__PURE__ */ jsxs("header", { className: "station-book__masthead", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "NUCLEUS ",
          /* @__PURE__ */ jsx("b", { children: "FIELD NOTES" })
        ] }),
        isMobile && page > 0 ? /* @__PURE__ */ jsxs("button", { type: "button", className: "station-book__fit", onClick: () => setFitPhoto((value) => !value), "aria-pressed": fitPhoto, children: [
          /* @__PURE__ */ jsx(Scan, { size: 18 }),
          /* @__PURE__ */ jsx("span", { children: "Fit full photo" })
        ] }) : /* @__PURE__ */ jsxs("span", { children: [
          "STATION / ",
          stationNumber
        ] })
      ] }),
      /* @__PURE__ */ jsx("h2", { className: "sr-only", children: name }),
      /* @__PURE__ */ jsx("div", { className: "station-book__scroller", ref: wrapper, children: /* @__PURE__ */ jsx("div", { className: "station-book__scroll-track", ref: content, style: { height: `calc(var(--book-height, 500px) + ${count * BOOK_SCROLL_STEP}px)` }, children: /* @__PURE__ */ jsxs("div", { className: "station-book__surface", ref: surface, tabIndex: 0, role: "region", "aria-label": `${name} event book`, "aria-describedby": instructions, children: [
        pages2.spread(showNext),
        !reduced && /* @__PURE__ */ jsx("div", { className: "station-book__leaf", ref: leaf, "aria-hidden": "true", inert: true, style: { visibility: turning ? "visible" : "hidden" }, children: pages2.leaf }, `${isMobile}:${page}`)
      ] }) }) }),
      /* @__PURE__ */ jsxs("footer", { className: "station-book__footer", children: [
        /* @__PURE__ */ jsx("div", { className: "station-book__progress", ref: progressBar, "aria-hidden": "true", children: /* @__PURE__ */ jsx(RailwayTrack, { className: "railway-track--horizontal" }) }),
        /* @__PURE__ */ jsxs("div", { className: "station-book__navigation", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => turn(-1), disabled: cursor <= 1e-4, "aria-label": "Previous book page", children: /* @__PURE__ */ jsx(ArrowLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxs("span", { role: "status", "aria-live": "polite", children: [
            "Page ",
            page + 1,
            " / ",
            count
          ] }),
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => turn(1), "aria-label": page === count - 1 ? "Close book after last page" : "Next book page", children: /* @__PURE__ */ jsx(ArrowRight, { size: 18 }) }),
          /* @__PURE__ */ jsxs("p", { id: instructions, children: [
            /* @__PURE__ */ jsx(ArrowDown, { size: 13 }),
            page === count - 1 ? "Scroll to close this chapter" : isMobile ? "Pull up to turn. Pull down to return." : "Scroll to turn · arrow keys work too"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "station-book__actions", children: [
          /* @__PURE__ */ jsx("div", { className: "station-book__links", children: links.map((link) => /* @__PURE__ */ jsxs("a", { href: link.url, target: "_blank", rel: "noreferrer", children: [
            link.label,
            /* @__PURE__ */ jsx(ArrowRight, { size: 12 })
          ] }, link.label)) }),
          /* @__PURE__ */ jsxs("button", { className: "nx-continue", onClick: onClose, children: [
            continueLabel,
            /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
          ] })
        ] }),
        galleryOnly && /* @__PURE__ */ jsx("p", { className: "station-book__capacity", children: "This event is available in the book; the track is at capacity." })
      ] })
    ] })
  ] }), document.body);
}
const loadRide = () => import("./assets/EventRollercoaster-vi8QZCuc.js").then((n) => n.E);
const EventRollercoaster = lazy(loadRide);
function EventsPage({ events: events2, onPublished }) {
  const [mode, setMode] = useState("grid");
  const [selected, setSelected] = useState(null);
  const [portal, setPortal] = useState(null);
  const [flying, setFlying] = useState(false);
  const [rideReady, setRideReady] = useState(false);
  const [flightElapsed, setFlightElapsed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const reduced = useReducedMotion();
  const dialog = useRef(null);
  const portalButtons = useRef([]);
  const lastPortal = useRef(0);
  const archive = useRef(null);
  const stations = useMemo(() => createEventStations(events2).map(populateWorkshopStation), [events2]);
  const station = stations.find((item) => item.id === selected);
  useCinematicScroll(mode === "grid" && !station && portal === null, false, (scroll, limit) => {
    archive.current?.style.setProperty("--rail-progress", String(limit > 0 ? Math.max(0, Math.min(1, scroll / limit)) : 0));
  });
  useEffect(() => {
    if (!flying) return;
    const timer = window.setTimeout(() => setFlightElapsed(true), reduced ? 80 : 1150);
    return () => clearTimeout(timer);
  }, [flying, reduced]);
  useEffect(() => {
    if (!flying || !rideReady || !flightElapsed) return;
    const timer = window.setTimeout(() => setFlying(false), reduced ? 0 : 420);
    return () => clearTimeout(timer);
  }, [flying, rideReady, flightElapsed, reduced]);
  useEffect(() => {
    if (portal === null) return;
    const element = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [portal]);
  const enterRide = () => {
    const bounds = portalButtons.current[portal]?.getBoundingClientRect();
    if (bounds) setOrigin({ x: (bounds.left + bounds.width / 2) / window.innerWidth * 100, y: Math.max(10, Math.min(90, (bounds.top + bounds.height / 2) / window.innerHeight * 100)) });
    lastPortal.current = portal;
    void loadRide();
    setPortal(null);
    setRideReady(false);
    setFlightElapsed(false);
    setFlying(true);
    setMode("immersive");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const returnToEvents = () => {
    setMode("grid");
    requestAnimationFrame(() => portalButtons.current[lastPortal.current]?.focus({ preventScroll: false }));
  };
  return /* @__PURE__ */ jsxs("section", { ref: archive, className: `events-page events-page--${mode}`, "data-event-mode": mode, "aria-label": "Nucleus events", children: [
    mode === "grid" ? /* @__PURE__ */ jsxs("div", { className: `events-archive${flying ? " events-archive--departing" : ""}`, inert: flying, children: [
      /* @__PURE__ */ jsx("div", { className: "events-railway-backdrop", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 1440 1000", preserveAspectRatio: "xMidYMid slice", children: [
        /* @__PURE__ */ jsx("path", { className: "events-railway-backdrop__sleepers", d: "M-160 820C280 820 190 100 620 100S1020 780 1600 390" }),
        /* @__PURE__ */ jsx("path", { className: "events-railway-backdrop__bed", d: "M-160 820C280 820 190 100 620 100S1020 780 1600 390" }),
        /* @__PURE__ */ jsx("path", { className: "events-railway-backdrop__line", d: "M-160 820C280 820 190 100 620 100S1020 780 1600 390" }),
        /* @__PURE__ */ jsx("circle", { cx: "620", cy: "100", r: "28" }),
        /* @__PURE__ */ jsx("circle", { cx: "620", cy: "100", r: "7" })
      ] }) }),
      /* @__PURE__ */ jsx("header", { className: "events-heading", children: /* @__PURE__ */ jsxs("h1", { children: [
        "Events",
        /* @__PURE__ */ jsx("span", { children: "." })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "events-grid", children: [
        stations.map((item) => /* @__PURE__ */ jsx("article", { className: "events-grid__item", style: { "--card-index": item.index }, children: /* @__PURE__ */ jsx(EventFlipCard, { event: item.event, photo: item.event?.photos?.[0], number: item.number, workshopFolder: item.workshop ?? item.id, onClick: () => setSelected(item.id) }) }, item.id)),
        /* @__PURE__ */ jsx("div", { className: "events-portal-lane events-portal-lane--left", children: /* @__PURE__ */ jsxs("button", { ref: (element) => {
          portalButtons.current[0] = element;
        }, type: "button", className: "events-portal", onClick: () => setPortal(0), "aria-haspopup": "dialog", "aria-label": "The Nucleus Ride", children: [
          /* @__PURE__ */ jsx(RailwayTrack, {}),
          /* @__PURE__ */ jsxs("span", { className: "events-portal__label", children: [
            /* @__PURE__ */ jsx("span", { className: "events-portal__type", children: "The Nucleus Ride" }),
            /* @__PURE__ */ jsxs("span", { className: "events-portal__sub", children: [
              "Board the journey ",
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 12 })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "events-portal-lane events-portal-lane--right", children: /* @__PURE__ */ jsxs("button", { ref: (element) => {
          portalButtons.current[1] = element;
        }, type: "button", className: "events-portal", onClick: () => setPortal(1), "aria-haspopup": "dialog", "aria-label": "The Nucleus Ride", children: [
          /* @__PURE__ */ jsx(RailwayTrack, {}),
          /* @__PURE__ */ jsxs("span", { className: "events-portal__label", children: [
            /* @__PURE__ */ jsx("span", { className: "events-portal__type", children: "The Nucleus Ride" }),
            /* @__PURE__ */ jsxs("span", { className: "events-portal__sub", children: [
              "Every stop, a story ",
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 12 })
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("footer", { className: "events-footer", children: [
        /* @__PURE__ */ jsx("span", { children: "Open a story. Relive a moment." }),
        /* @__PURE__ */ jsx("span", { children: "Made of many minds." })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("button", { className: "events-return", onClick: returnToEvents, children: [
        /* @__PURE__ */ jsx(ArrowLeft, { size: 15 }),
        "Back to Events"
      ] }),
      /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsxs("div", { className: "events-opening", role: "status", children: [
        "Opening the Nucleus Ride",
        /* @__PURE__ */ jsx("span", {})
      ] }), children: /* @__PURE__ */ jsx(EventRollercoaster, { events: events2, onPublished, onReady: () => setRideReady(true) }) })
    ] }),
    station && /* @__PURE__ */ jsx(Book, { workshopFolder: station.workshop ?? station.id, imageList: station.event?.photos ?? [], event: station.event, title: station.name, stationNumber: station.number, onClose: () => setSelected(null) }, station.id),
    portal !== null && /* @__PURE__ */ jsxs("dialog", { ref: dialog, className: "events-portal-dialog", "aria-labelledby": "portal-title", onCancel: (event) => {
      event.preventDefault();
      setPortal(null);
    }, children: [
      /* @__PURE__ */ jsx("button", { className: "events-portal-dialog__close", "aria-label": "Close ride invitation", onClick: () => setPortal(null), children: /* @__PURE__ */ jsx(X, { size: 18 }) }),
      /* @__PURE__ */ jsx(Orbit, { size: 38, "aria-hidden": "true" }),
      /* @__PURE__ */ jsx("p", { className: "events-eyebrow", children: "A different perspective" }),
      /* @__PURE__ */ jsx("h2", { id: "portal-title", children: "Do you want to hop into the Nucleus Ride?" }),
      /* @__PURE__ */ jsx("p", { children: "Seven stations. One journey through Nucleus." }),
      /* @__PURE__ */ jsxs("div", { className: "events-portal-dialog__actions", children: [
        /* @__PURE__ */ jsxs("button", { onClick: enterRide, children: [
          "Yes, Let's Go",
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setPortal(null), children: "Maybe Later" })
      ] })
    ] }),
    flying && /* @__PURE__ */ jsxs("div", { className: `events-flight${rideReady && flightElapsed ? " events-flight--ready" : ""}`, role: "status", "aria-label": "Entering the Nucleus Ride", style: { "--portal-x": `${origin.x}%`, "--portal-y": `${origin.y}%` }, children: [
      /* @__PURE__ */ jsx("div", { className: "events-flight__flash" }),
      /* @__PURE__ */ jsx("div", { className: "events-flight__tunnel", "aria-hidden": "true", children: [0, 1, 2, 3, 4].map((index) => /* @__PURE__ */ jsx("i", { style: { "--ring": index } }, index)) }),
      /* @__PURE__ */ jsxs("div", { className: "events-flight__caption", children: [
        /* @__PURE__ */ jsx("span", { children: "CONNECTION ESTABLISHED" }),
        /* @__PURE__ */ jsx("strong", { children: "The Nucleus Ride" }),
        /* @__PURE__ */ jsx("small", { children: rideReady ? "You’re in. Enjoy the ride." : "Finding our way into Nucleus…" }),
        /* @__PURE__ */ jsx("i", {})
      ] })
    ] })
  ] });
}
const EventsPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EventsPage
}, Symbol.toStringTag, { value: "Module" }));
function WashDrum({ id }) {
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: `${id}-rim`, x1: "0", y1: "0", x2: "1", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#ffffff" }),
        /* @__PURE__ */ jsx("stop", { offset: ".42", stopColor: "#c3d0c9" }),
        /* @__PURE__ */ jsx("stop", { offset: ".7", stopColor: "#f3f7f3" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#9bada4" })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: `${id}-glass`, cx: ".35", cy: ".25", r: ".8", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#31574e" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#102b25" })
      ] }),
      /* @__PURE__ */ jsx("clipPath", { id: `${id}-clip`, children: /* @__PURE__ */ jsx("circle", { cx: "150", cy: "150", r: "108" }) })
    ] }),
    /* @__PURE__ */ jsx("circle", { cx: "150", cy: "153", r: "143", fill: "#719486", opacity: ".16" }),
    /* @__PURE__ */ jsx("circle", { cx: "150", cy: "150", r: "139", fill: `url(#${id}-rim)`, stroke: "#a4b8ac" }),
    /* @__PURE__ */ jsx("circle", { cx: "150", cy: "150", r: "122", fill: "#769187" }),
    /* @__PURE__ */ jsx("circle", { cx: "150", cy: "150", r: "116", fill: `url(#${id}-glass)`, stroke: "#213d34", strokeWidth: "5" }),
    /* @__PURE__ */ jsxs("g", { clipPath: `url(#${id}-clip)`, children: [
      /* @__PURE__ */ jsxs("g", { className: "laundroid-drum__load", children: [
        /* @__PURE__ */ jsx("path", { d: "M65 176 Q62 147 83 139 L119 127 L144 146 L134 193 L95 216 Z", fill: "#b1d5b5" }),
        /* @__PURE__ */ jsx("path", { d: "M83 142 Q105 151 119 130 M82 161 L112 188", fill: "none", stroke: "#719c81", strokeWidth: "3" }),
        /* @__PURE__ */ jsx("path", { d: "M151 167 L165 122 Q169 111 184 114 L216 135 L225 188 L199 218 L164 207 Z", fill: "#e4eee2" }),
        /* @__PURE__ */ jsx("path", { d: "M180 120 L178 165 L205 184", fill: "none", stroke: "#b0cbb9", strokeWidth: "3" }),
        /* @__PURE__ */ jsx("path", { d: "M95 208 Q131 168 155 186 Q178 202 210 213 L208 244 L100 245 Z", fill: "#73a994" }),
        /* @__PURE__ */ jsx("path", { d: "M121 212 Q155 196 169 215", fill: "none", stroke: "#487e69", strokeWidth: "3" })
      ] }),
      /* @__PURE__ */ jsx("path", { d: "M35 199 Q85 185 139 201 T267 199 V271 H35 Z", fill: "#8dcdb8", opacity: ".23" }),
      /* @__PURE__ */ jsxs("g", { className: "laundroid-drum__bubbles", fill: "none", stroke: "#d5eee0", strokeWidth: "1.5", opacity: ".6", children: [
        /* @__PURE__ */ jsx("circle", { cx: "82", cy: "186", r: "5" }),
        /* @__PURE__ */ jsx("circle", { cx: "215", cy: "162", r: "7" }),
        /* @__PURE__ */ jsx("circle", { cx: "194", cy: "210", r: "4" }),
        /* @__PURE__ */ jsx("circle", { cx: "103", cy: "222", r: "3" })
      ] }),
      /* @__PURE__ */ jsx("path", { d: "M66 121 A91 91 0 0 1 152 61", fill: "none", stroke: "#e5fff2", strokeWidth: "12", strokeLinecap: "round", opacity: ".12" }),
      /* @__PURE__ */ jsx("path", { d: "M68 130 A89 89 0 0 1 75 109", fill: "none", stroke: "#e5fff2", strokeWidth: "4", strokeLinecap: "round", opacity: ".32" })
    ] }),
    /* @__PURE__ */ jsx("path", { d: "M271 121 Q281 150 271 179", fill: "none", stroke: "#f6faf6", strokeWidth: "9", strokeLinecap: "round" })
  ] });
}
function WashingMachine() {
  const id = useId();
  return /* @__PURE__ */ jsxs("svg", { className: "laundroid-machine", viewBox: "0 0 400 460", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: `${id}-body`, x1: ".1", y1: "0", x2: ".9", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#fafcf8" }),
        /* @__PURE__ */ jsx("stop", { offset: ".55", stopColor: "#e8eee5" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#c7d6cb" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: `${id}-side`, x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#b4c7bb" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#9fb7a8" })
      ] }),
      /* @__PURE__ */ jsxs("radialGradient", { id: `${id}-shadow`, children: [
        /* @__PURE__ */ jsx("stop", { stopColor: "#173a2b", stopOpacity: ".23" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#173a2b", stopOpacity: "0" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("ellipse", { cx: "201", cy: "429", rx: "185", ry: "27", fill: `url(#${id}-shadow)` }),
    /* @__PURE__ */ jsx("rect", { x: "75", y: "399", width: "34", height: "21", rx: "6", fill: "#4c6a58" }),
    /* @__PURE__ */ jsx("rect", { x: "296", y: "399", width: "34", height: "21", rx: "6", fill: "#4c6a58" }),
    /* @__PURE__ */ jsx("path", { d: "M316 36 L349 53 Q360 59 360 76 V386 Q360 404 341 410 L316 412 Z", fill: `url(#${id}-side)`, stroke: "#9ab09f" }),
    /* @__PURE__ */ jsx("rect", { x: "48", y: "35", width: "286", height: "377", rx: "25", fill: `url(#${id}-body)`, stroke: "#a6bca9", strokeWidth: "1.5" }),
    /* @__PURE__ */ jsx("rect", { x: "54", y: "41", width: "274", height: "363", rx: "21", stroke: "#fff", strokeOpacity: ".65" }),
    /* @__PURE__ */ jsx("path", { d: "M49 119 H333", stroke: "#b9cbbb" }),
    /* @__PURE__ */ jsx("path", { d: "M49 121 H333", stroke: "#fff", strokeOpacity: ".7" }),
    /* @__PURE__ */ jsx("rect", { x: "67", y: "59", width: "88", height: "40", rx: "7", fill: "#e2e9df", stroke: "#b5c6b7" }),
    /* @__PURE__ */ jsx("path", { d: "M83 89 H138", stroke: "#9caf9f", strokeWidth: "3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("text", { x: "81", y: "77", fill: "#496454", fontSize: "8", fontFamily: "sans-serif", fontWeight: "600", letterSpacing: "1", children: "iLAUNDROID" }),
    /* @__PURE__ */ jsx("circle", { cx: "195", cy: "80", r: "23", fill: "#b5c6b8" }),
    /* @__PURE__ */ jsx("circle", { cx: "195", cy: "78", r: "21", fill: "#f7f9f2", stroke: "#c2cec0" }),
    /* @__PURE__ */ jsx("path", { d: "M195 61 V69", stroke: "#315b43", strokeWidth: "3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("rect", { x: "239", y: "59", width: "75", height: "41", rx: "6", fill: "#203d30" }),
    /* @__PURE__ */ jsx("circle", { cx: "251", cy: "72", r: "2", fill: "#c1efad" }),
    /* @__PURE__ */ jsx("text", { x: "260", y: "75", fill: "#c3e5c8", fontSize: "7", fontFamily: "monospace", letterSpacing: "1", children: "READY" }),
    /* @__PURE__ */ jsx("path", { d: "M250 87 H269 M276 87 H281 M288 87 H302", stroke: "#92b49b", strokeWidth: "2", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("g", { transform: "translate(62 131) scale(.86)", children: /* @__PURE__ */ jsx(WashDrum, { id }) }),
    /* @__PURE__ */ jsx("path", { d: "M68 386 H238", stroke: "#b2c5b5" }),
    /* @__PURE__ */ jsx("path", { d: "M69 391 H223", stroke: "#fff", strokeOpacity: ".7" }),
    /* @__PURE__ */ jsx("rect", { x: "286", y: "375", width: "26", height: "18", rx: "5", stroke: "#a7bdac" })
  ] });
}
function LaundroidDetails({ project, trigger, onClose }) {
  const id = useId();
  const dialog = useRef(null);
  const exitAnimation = useRef(null);
  const closing = useRef(false);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (!dialog.current || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    exitAnimation.current = dialog.current.animate([
      { opacity: 1, transform: "translateY(0) scale(1)" },
      { opacity: 0, transform: "translateY(12px) scale(.985)" }
    ], { duration: 180, easing: "ease-in", fill: "forwards" });
    void exitAnimation.current.finished.then(onClose, () => {
    });
  }, [onClose]);
  useEffect(() => {
    const element = dialog.current;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    closing.current = false;
    element.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    element.querySelector("button")?.focus({ preventScroll: true });
    const opener = trigger.current;
    return () => {
      exitAnimation.current?.cancel();
      element.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [trigger]);
  return createPortal(/* @__PURE__ */ jsxs(
    "dialog",
    {
      ref: dialog,
      className: "laundroid-details",
      "aria-labelledby": `${id}-title`,
      "data-lenis-prevent": true,
      onCancel: (event) => {
        event.preventDefault();
        close();
      },
      onClick: (event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
      },
      onKeyDown: (event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll("button, a[href]");
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      },
      children: [
        /* @__PURE__ */ jsxs("header", { className: "laundroid-details__controls", children: [
          /* @__PURE__ */ jsx("div", { className: "laundroid-details__drawer", children: /* @__PURE__ */ jsx("span", { children: "NUCLEUS" }) }),
          /* @__PURE__ */ jsx("div", { className: "laundroid-details__dial", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", {}) }),
          /* @__PURE__ */ jsx("button", { className: "laundroid-details__close", type: "button", onClick: close, "aria-label": "Close project details", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "laundroid-details__body", children: [
          /* @__PURE__ */ jsx("div", { className: "laundroid-details__porthole", children: /* @__PURE__ */ jsx("svg", { className: "laundroid-details__drum", viewBox: "0 0 300 300", "aria-hidden": "true", children: /* @__PURE__ */ jsx(WashDrum, { id }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "laundroid-details__copy", children: [
            /* @__PURE__ */ jsxs("span", { className: "laundroid-details__category", children: [
              project.domain,
              " / ",
              project.status
            ] }),
            /* @__PURE__ */ jsx("h2", { id: `${id}-title`, children: project.title }),
            (project.url || project.repositoryUrl) && /* @__PURE__ */ jsxs("div", { className: "laundroid-details__links", children: [
              project.url && /* @__PURE__ */ jsxs("a", { href: project.url, target: "_blank", rel: "noreferrer", children: [
                "Explore project ",
                /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
              ] }),
              project.repositoryUrl && /* @__PURE__ */ jsxs("a", { href: project.repositoryUrl, target: "_blank", rel: "noreferrer", children: [
                "Source code ",
                /* @__PURE__ */ jsx(Github, { size: 16 })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "laundroid-details__base", "aria-hidden": "true", children: /* @__PURE__ */ jsx("span", { className: "laundroid-details__vent" }) })
      ]
    }
  ), document.body);
}
function LaundroidProject({ project }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("article", { className: "work-feature laundroid-card", "aria-labelledby": `project-${project.id}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "laundroid-card__scene", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx("span", { className: "laundroid-card__orbit laundroid-card__orbit--one" }),
        /* @__PURE__ */ jsx("span", { className: "laundroid-card__orbit laundroid-card__orbit--two" }),
        /* @__PURE__ */ jsx("span", { className: "laundroid-card__bubble laundroid-card__bubble--one" }),
        /* @__PURE__ */ jsx("span", { className: "laundroid-card__bubble laundroid-card__bubble--two" }),
        /* @__PURE__ */ jsx("span", { className: "laundroid-card__bubble laundroid-card__bubble--three" }),
        /* @__PURE__ */ jsx(WashingMachine, {})
      ] }),
      /* @__PURE__ */ jsx("div", { className: "laundroid-card__copy", children: /* @__PURE__ */ jsx("h2", { id: `project-${project.id}`, children: project.title }) }),
      /* @__PURE__ */ jsx("div", { className: "laundroid-card__footer", children: /* @__PURE__ */ jsxs("span", { children: [
        project.domain,
        /* @__PURE__ */ jsx("i", {}),
        project.status
      ] }) }),
      /* @__PURE__ */ jsx("button", { ref: trigger, type: "button", className: "laundroid-card__open", "aria-label": `Explore ${project.title}`, "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => setOpen(true), children: /* @__PURE__ */ jsxs("span", { className: "laundroid-card__cta", children: [
        "View project ",
        /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(ArrowUpRight, { size: 20 }) })
      ] }) })
    ] }),
    open && /* @__PURE__ */ jsx(LaundroidDetails, { project, trigger, onClose: () => setOpen(false) })
  ] });
}
function ProjectArtwork({ project, index }) {
  return /* @__PURE__ */ jsxs("div", { className: "work-art", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("div", { className: "work-art-grid" }),
    /* @__PURE__ */ jsxs("span", { className: "work-art-index", children: [
      "N / ",
      String(index + 1).padStart(2, "0")
    ] }),
    /* @__PURE__ */ jsx("div", { className: "work-orbit work-orbit--outer" }),
    /* @__PURE__ */ jsx("div", { className: "work-orbit work-orbit--inner" }),
    /* @__PURE__ */ jsx("div", { className: "work-monogram", children: project.title.slice(0, 1) }),
    /* @__PURE__ */ jsxs("div", { className: "work-art-caption", children: [
      /* @__PURE__ */ jsx("span", { children: project.title }),
      /* @__PURE__ */ jsx("span", { children: project.domain })
    ] })
  ] });
}
function WorkPage({ projects: projects2, settings: settings2 }) {
  return /* @__PURE__ */ jsxs("section", { className: "showcase-page work-page section-wrap", "aria-labelledby": "work-title", children: [
    /* @__PURE__ */ jsx("h1", { id: "work-title", className: "sr-only", children: "Our work" }),
    /* @__PURE__ */ jsx("div", { className: "work-list", children: projects2.map((project, index) => /* @__PURE__ */ jsx(Reveal, { children: project.id === "i-laundroid" ? /* @__PURE__ */ jsx(LaundroidProject, { project }) : /* @__PURE__ */ jsxs("article", { className: "work-feature", "aria-labelledby": `project-${project.id}`, children: [
      /* @__PURE__ */ jsx(ProjectArtwork, { project, index }),
      /* @__PURE__ */ jsxs("div", { className: "work-copy", children: [
        /* @__PURE__ */ jsxs("div", { className: "work-meta", children: [
          /* @__PURE__ */ jsx("span", { children: project.domain }),
          /* @__PURE__ */ jsx("span", { className: "status-dot", children: project.status })
        ] }),
        /* @__PURE__ */ jsx("h2", { id: `project-${project.id}`, children: project.title }),
        /* @__PURE__ */ jsx("p", { children: project.description }),
        /* @__PURE__ */ jsxs("div", { className: "work-links", children: [
          project.url && /* @__PURE__ */ jsxs("a", { className: "button primary", href: project.url, target: "_blank", rel: "noreferrer", children: [
            "Explore project ",
            /* @__PURE__ */ jsx(ArrowUpRight, { size: 17 })
          ] }),
          project.repositoryUrl && /* @__PURE__ */ jsxs("a", { className: "text-link", href: project.repositoryUrl, target: "_blank", rel: "noreferrer", children: [
            "Source code ",
            /* @__PURE__ */ jsx(Github, { size: 17 })
          ] }),
          !project.url && !project.repositoryUrl && /* @__PURE__ */ jsxs("a", { className: "text-link", href: `mailto:${settings2.contactEmail}?subject=${encodeURIComponent(`Tell me about ${project.title}`)}`, children: [
            "About this project ",
            /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 })
          ] })
        ] })
      ] })
    ] }) }, project.id)) }),
    !projects2.length && /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
      /* @__PURE__ */ jsx("p", { children: "New projects are taking shape." }),
      /* @__PURE__ */ jsxs("a", { className: "text-link", href: settings2.githubUrl, target: "_blank", rel: "noreferrer", children: [
        "Follow on GitHub ",
        /* @__PURE__ */ jsx(ArrowUpRight, { size: 17 })
      ] })
    ] })
  ] });
}
const WorkPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: WorkPage
}, Symbol.toStringTag, { value: "Module" }));
const icons = { linkedin: Linkedin, github: Github, leetcode: Code2, instagram: Instagram, website: Globe };
function TeamProfileOverlay({ person, onClose }) {
  const dialog = useRef(null);
  const closing = useRef(false);
  const animation = useRef(null);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    animation.current?.kill();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    animation.current = gsap.to(dialog.current, { opacity: 0, duration: 0.2, ease: "power2.in", onComplete: onClose });
  }, [onClose]);
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    closing.current = false;
    element.showModal();
    element.querySelector("button")?.focus({ preventScroll: true });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animation.current = gsap.timeline().fromTo(element, { opacity: 0 }, { opacity: 1, duration: 0.3 }).fromTo(element.querySelector(".team-profile__copy"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, 0.08).fromTo(element.querySelector(".team-profile__photo"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.08);
    }
    return () => {
      animation.current?.kill();
      element.close();
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(/* @__PURE__ */ jsxs(
    "dialog",
    {
      ref: dialog,
      className: "team-profile",
      "aria-labelledby": "team-profile-name",
      "aria-describedby": "team-profile-tagline",
      "data-lenis-prevent": true,
      onCancel: (event) => {
        event.preventDefault();
        close();
      },
      onKeyDown: (event) => {
        if (event.key !== "Tab") return;
        const controls = event.currentTarget.querySelectorAll("button:not(:disabled), a[href]");
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      },
      children: [
        /* @__PURE__ */ jsxs("button", { type: "button", className: "team-profile__back", onClick: close, children: [
          /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
          /* @__PURE__ */ jsx("span", { children: "Back to the team" }),
          /* @__PURE__ */ jsx(X, { size: 16 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "team-profile__layout", children: [
          /* @__PURE__ */ jsxs("div", { className: "team-profile__details", children: [
            /* @__PURE__ */ jsxs("div", { className: "team-profile__copy", children: [
              /* @__PURE__ */ jsx("p", { className: "team-profile__role", children: person.role }),
              /* @__PURE__ */ jsx("h2", { id: "team-profile-name", children: person.name }),
              /* @__PURE__ */ jsx("p", { id: "team-profile-tagline", className: "team-profile__tagline", children: person.tagline }),
              /* @__PURE__ */ jsx("nav", { className: "team-profile__socials", "aria-label": `${person.name}'s social profiles`, children: person.socials.map((social) => {
                const Icon = icons[social.platform];
                return /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: social.url,
                    target: social.url === "#" ? void 0 : "_blank",
                    rel: "noopener noreferrer",
                    onClick: (event) => {
                      if (social.url === "#") event.preventDefault();
                    },
                    children: [
                      /* @__PURE__ */ jsx(Icon, { size: 17 }),
                      /* @__PURE__ */ jsx("span", { children: social.label }),
                      /* @__PURE__ */ jsx(ArrowUpRight, { size: 13 })
                    ]
                  },
                  social.platform
                );
              }) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "team-profile__signature", children: [
              /* @__PURE__ */ jsx("span", { children: "NUCLEUS / SJEC" }),
              /* @__PURE__ */ jsx("span", { children: "Made of many minds." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "team-profile__photo", style: person.previewImage ? { backgroundImage: `url("${person.previewImage}")` } : void 0, children: [
            !person.previewImage && /* @__PURE__ */ jsx("span", { className: "team-profile__initials", "aria-hidden": "true", children: person.initials }),
            person.cardImage && /* @__PURE__ */ jsx("img", { className: "team-profile__preview", src: person.cardImage, alt: "", "aria-hidden": "true", onError: (event) => {
              event.currentTarget.style.visibility = "hidden";
            } }),
            person.profileImage && /* @__PURE__ */ jsx(
              "img",
              {
                className: "team-profile__portrait",
                src: person.profileImage,
                alt: person.name,
                decoding: "async",
                fetchPriority: "high",
                onError: (event) => {
                  event.currentTarget.style.visibility = "hidden";
                }
              }
            )
          ] })
        ] })
      ]
    }
  ), document.body);
}
function TowerPlayButton({ disabled, paused, onClick }) {
  const button = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (button.current) observer.observe(button.current);
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const row = (level, upper = false) => /* @__PURE__ */ jsx(
    "span",
    {
      className: "jenga-preview__row",
      style: { "--level": upper ? level - 3 : level, "--cross": level % 2 },
      children: [0, 1, 2].map((column) => /* @__PURE__ */ jsxs(
        "span",
        {
          className: `jenga-preview__piece${level === 2 && column === 1 ? " jenga-preview__block" : ""}`,
          style: { "--column": column },
          children: [
            /* @__PURE__ */ jsx("span", { className: "jenga-preview__face jenga-preview__face--front" }),
            /* @__PURE__ */ jsx("span", { className: "jenga-preview__face jenga-preview__face--side" }),
            /* @__PURE__ */ jsx("span", { className: "jenga-preview__face jenga-preview__face--left" }),
            /* @__PURE__ */ jsx("span", { className: "jenga-preview__face jenga-preview__face--top" })
          ]
        },
        column
      ))
    },
    level
  );
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ref: button,
      type: "button",
      className: "people-tower-button",
      disabled,
      onClick,
      "aria-labelledby": "people-tower-button-title",
      "aria-describedby": "people-tower-button-description",
      "data-animating": visible && !hidden && !paused && !disabled,
      children: [
        /* @__PURE__ */ jsxs("span", { className: "people-tower-button__copy", children: [
          /* @__PURE__ */ jsxs("span", { className: "people-tower-button__eyebrow", children: [
            /* @__PURE__ */ jsx("span", {}),
            " Meet the team. Make your move."
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "people-tower-button__title", children: [
            "Your ",
            /* @__PURE__ */ jsx("em", { children: "move." })
          ] }),
          /* @__PURE__ */ jsxs("span", { id: "people-tower-button-description", className: "people-tower-button__description", children: [
            "Pull a block. Meet a mind.",
            /* @__PURE__ */ jsx("br", {}),
            "Get to know the team, one piece at a time."
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "people-tower-button__cta", children: [
            /* @__PURE__ */ jsx("span", { id: "people-tower-button-title", children: "Play Interactive Tower" }),
            /* @__PURE__ */ jsx("span", { className: "people-tower-button__arrow", children: /* @__PURE__ */ jsx(ArrowUpRight, { size: 18, strokeWidth: 1.8 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "jenga-preview", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsxs("span", { className: "jenga-preview__caption", children: [
            "THE NUCLEUS TOWER ",
            /* @__PURE__ */ jsx("span", { children: "PULL / PLAY" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "jenga-preview__ground" }),
          /* @__PURE__ */ jsxs("span", { className: "jenga-preview__stack", children: [
            /* @__PURE__ */ jsx("span", { className: "jenga-preview__upper", children: [3, 4, 5].map((level) => row(level, true)) }),
            [0, 1, 2].map((level) => row(level))
          ] }),
          /* @__PURE__ */ jsx("span", { className: "jenga-preview__hint", children: "ONE BLOCK. YOUR NEXT CONNECTION." })
        ] })
      ]
    }
  );
}
const PeopleTower = lazy(() => import("./assets/PeopleTower-CC6SUXHS.js"));
class TowerBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? /* @__PURE__ */ jsx("p", { className: "people-view-status", role: "alert", children: "The tower could not load. Go back to the team to meet everyone." }) : this.props.children;
  }
}
function MemberCard({ person, index, onSelect }) {
  const card = useRef(null);
  useReveal(card, { delay: index % 3 * 60 });
  const prepare = () => {
    if (person.profileImage) preloadImage({ src: person.profileImage, priority: "high" });
  };
  return /* @__PURE__ */ jsx("li", { ref: card, className: "people-card", children: /* @__PURE__ */ jsxs("button", { type: "button", onPointerEnter: prepare, onFocus: prepare, onTouchStart: prepare, onClick: () => onSelect(person), "aria-label": `Meet ${person.name}, ${person.role}`, children: [
    /* @__PURE__ */ jsxs("span", { className: "people-card__portrait", children: [
      /* @__PURE__ */ jsx("span", { className: "people-card__initials", "aria-hidden": "true", children: person.initials }),
      person.cardImage && /* @__PURE__ */ jsx(
        "img",
        {
          src: person.cardImage,
          alt: "",
          loading: index < 3 ? "eager" : "lazy",
          decoding: "async",
          fetchPriority: index === 0 ? "high" : "auto",
          style: person.previewImage ? { backgroundImage: `url("${person.previewImage}")`, backgroundSize: "cover", backgroundPosition: "center" } : void 0,
          width: "400",
          height: "500",
          onError: (event) => {
            event.currentTarget.style.visibility = "hidden";
          }
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "people-card__number", "aria-hidden": "true", children: [
        String(index + 1).padStart(2, "0"),
        " / NUCLEUS"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "people-card__open", "aria-hidden": "true", children: /* @__PURE__ */ jsx(ArrowUpRight, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "people-card__copy", children: [
      /* @__PURE__ */ jsx("span", { className: "people-card__role", children: person.role }),
      /* @__PURE__ */ jsx("span", { className: "people-card__name", children: person.name })
    ] })
  ] }) });
}
function PeoplePage({ members }) {
  const [view, setView] = useState("grid");
  const [group, setGroup] = useState("member");
  const [towerStatus, setTowerStatus] = useState("loading");
  const [selected, setSelected] = useState(null);
  const roster = useRef(null);
  const profiles = useMemo(() => createTeamProfiles(members), [members]);
  const currentMembers = useMemo(() => members.filter((person) => person.status !== "alumni"), [members]);
  const visibleProfiles = profiles.filter((person) => (person.status ?? "member") === group);
  const closeProfile = useCallback(() => setSelected(null), []);
  const previousView = useRef(view);
  const previousGroup = useRef(group);
  useEffect(() => {
    if (view !== "tower") return;
    document.documentElement.classList.add("people-tower-open");
    return () => document.documentElement.classList.remove("people-tower-open");
  }, [view]);
  useEffect(() => {
    if (previousGroup.current === group) return;
    previousGroup.current = group;
    meetTeam();
  }, [group]);
  useEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector(view === "grid" ? "#people-title" : ".people-view-toggle")?.focus({ preventScroll: true });
  }, [view]);
  function meetTeam() {
    roster.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    roster.current?.focus({ preventScroll: true });
  }
  return /* @__PURE__ */ jsxs("section", { className: "people-page", "data-view": view, "data-tower-status": view === "tower" ? towerStatus : void 0, children: [
    /* @__PURE__ */ jsx("h1", { id: "people-title", className: "sr-only", children: "The people behind Nucleus" }),
    /* @__PURE__ */ jsx("div", { className: "people-toolbar", children: view === "grid" ? null : /* @__PURE__ */ jsxs("button", { type: "button", className: "people-view-toggle", onClick: () => setView("grid"), children: [
      /* @__PURE__ */ jsx(ArrowLeft, { size: 16 }),
      "Back to the team"
    ] }) }),
    view === "grid" ? /* @__PURE__ */ jsxs("div", { className: "people-directory people-view", children: [
      /* @__PURE__ */ jsx("div", { className: "people-intro", children: /* @__PURE__ */ jsx("div", { className: "people-groups", role: "group", "aria-label": "Browse the community", style: { margin: 0, padding: 0, border: "none" }, children: /* @__PURE__ */ jsx("div", { children: ["member", "alumni"].map((option) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          "aria-pressed": group === option,
          "aria-controls": "people-roster",
          onClick: () => setGroup(option),
          children: [
            option === "member" ? "Members" : "Alumni",
            /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
          ]
        },
        option
      )) }) }) }),
      /* @__PURE__ */ jsxs("section", { ref: roster, id: "people-roster", className: "people-directory__roster", "aria-labelledby": "people-roster-title", tabIndex: -1, children: [
        /* @__PURE__ */ jsxs("div", { className: "people-directory__heading", children: [
          /* @__PURE__ */ jsx("h2", { id: "people-roster-title", children: group === "member" ? "The minds behind it." : "Always part of the nucleus." }),
          /* @__PURE__ */ jsxs("p", { "aria-live": "polite", children: [
            String(visibleProfiles.length).padStart(2, "0"),
            " ",
            group === "member" ? "members" : "alumni",
            /* @__PURE__ */ jsx("span", { children: "Choose a card. Get to know us." })
          ] })
        ] }),
        visibleProfiles.length ? /* @__PURE__ */ jsx("ul", { className: "people-grid", "aria-label": group === "member" ? "Members" : "Alumni", children: visibleProfiles.map((person, index) => /* @__PURE__ */ jsx(MemberCard, { person, index, onSelect: setSelected }, `${group}-${person.id}`)) }) : /* @__PURE__ */ jsx("p", { className: "people-empty", role: "status", children: group === "member" ? "The team will be announced here soon." : "Alumni profiles are coming soon." })
      ] }),
      /* @__PURE__ */ jsx(
        TowerPlayButton,
        {
          disabled: !currentMembers.length,
          paused: !!selected,
          onClick: () => {
            setTowerStatus("loading");
            setView("tower");
          }
        }
      )
    ] }, "grid") : /* @__PURE__ */ jsx("div", { className: "people-view", children: /* @__PURE__ */ jsx(TowerBoundary, { children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("p", { className: "people-view-status", role: "status", children: "Building the interactive tower..." }), children: /* @__PURE__ */ jsx(PeopleTower, { members: currentMembers, onStatusChange: setTowerStatus }) }) }) }, "tower"),
    selected && /* @__PURE__ */ jsx(TeamProfileOverlay, { person: selected, onClose: closeProfile })
  ] });
}
const PeoplePage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PeoplePage
}, Symbol.toStringTag, { value: "Module" }));
function Recruitment({ settings: settings2 }) {
  return /* @__PURE__ */ jsxs("section", { className: "recruitment-page recruitment-page--application section-wrap", children: [
    /* @__PURE__ */ jsxs("header", { className: "recruitment-heading", children: [
      /* @__PURE__ */ jsx("span", { className: "eyebrow", children: "Nucleus · SJEC" }),
      /* @__PURE__ */ jsx("h1", { children: "Recruitment" })
    ] }),
    /* @__PURE__ */ jsx(RecruitmentApplication, { initialSettings: settings2 })
  ] });
}
const Recruitment$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Recruitment
}, Symbol.toStringTag, { value: "Module" }));
const achievementCategories = ["All", "Hackathons", "Open source", "Competitive programming", "Research"];
const memberAchievements = [];
const sampleResults = [
  { title: "Campus Buildathon", category: "Hackathons", result: "Winner", year: "2026", description: "" },
  { title: "Open Source Fellowship", category: "Open source", result: "Selected contributor", year: "2026", description: "" },
  { title: "Code Sprint", category: "Competitive programming", result: "Top 10", year: "2025", description: "" },
  { title: "Student Research Forum", category: "Research", result: "Paper presented", year: "2026", description: "" },
  { title: "Build for Good", category: "Hackathons", result: "Finalist", year: "2025", description: "" },
  { title: "Community Code Fest", category: "Open source", result: "Project contributor", year: "2025", description: "" }
];
const sampleMemberIds = ["prajwal", "navya", "mohit", "rakshith", "joylin", "saniya"];
const sampleAssignments = [[0, 1, 2], [2, 0], [3, 4, 1], [1, 5, 4], [4, 3], [5, 2]];
async function fetchAchievements(signal) {
  const { supabase: supabase2 } = await Promise.resolve().then(() => supabase$1);
  const { data: acts, error: e1 } = await supabase2.from("achievements").select("*").order("created_at", { ascending: false }).abortSignal(signal || new AbortController().signal);
  const { data: mems, error: e2 } = await supabase2.from("achievement_members").select("*").abortSignal(signal || new AbortController().signal);
  if (e1) throw e1;
  if (e2) throw e2;
  return (acts || []).map((a) => ({
    ...a,
    memberIds: (mems || []).filter((m) => m.achievement_id === a.id).map((m) => m.member_id)
  }));
}
function createAchievementProfiles(members, fetchedAchievements) {
  const isPreview = fetchedAchievements.length === 0;
  if (!isPreview) return { isPreview, profiles: members.map((member) => ({ member, achievements: fetchedAchievements.filter((record) => record.memberIds.includes(member.id)) })).filter((profile) => profile.achievements.length > 0) };
  const preferred = sampleMemberIds.map((id) => members.find((member) => member.id === id)).filter((member) => Boolean(member));
  const previewMembers = [...preferred, ...members.filter((member) => !sampleMemberIds.includes(member.id))].slice(0, 6);
  return { isPreview, profiles: previewMembers.map((member, index) => ({ member, achievements: sampleAssignments[index].map((resultIndex) => ({ ...sampleResults[resultIndex], id: `sample-${member.id}-${resultIndex}`, memberIds: [member.id], sample: true })) })) };
}
const achievements = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  achievementCategories,
  createAchievementProfiles,
  fetchAchievements,
  memberAchievements
}, Symbol.toStringTag, { value: "Module" }));
const number = (value) => String(value).padStart(2, "0");
function MemberPortrait({ member }) {
  const [failedImage, setFailedImage] = useState();
  return /* @__PURE__ */ jsxs("span", { className: "ach-portrait", children: [
    /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: member.initials }),
    member.image && failedImage !== member.image && /* @__PURE__ */ jsx("img", { src: member.image, alt: member.name, width: "120", height: "144", loading: "lazy", decoding: "async", onError: () => setFailedImage(member.image) })
  ] });
}
function AchievementsPage({ members, settings: settings2 }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const search = useRef(null);
  const [fetchedAchievements, setFetchedAchievements] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => achievements).then((m) => m.fetchAchievements(controller.signal)).then(setFetchedAchievements).catch(() => {
    });
    return () => controller.abort();
  }, []);
  const { profiles, isPreview } = useMemo(() => createAchievementProfiles(members, fetchedAchievements), [members, fetchedAchievements]);
  const categories = achievementCategories.filter((item) => item === "All" || profiles.some((profile) => profile.achievements.some((record) => record.category === item)));
  const activeCategory = categories.some((item) => item === category) ? category : "All";
  const visible = profiles.filter((profile) => {
    const eligible = profile.achievements.filter((record) => activeCategory === "All" || record.category === activeCategory);
    return eligible.length > 0 && [profile.member.name, profile.member.role, ...eligible.flatMap((record) => [record.title, record.result, record.category, record.year])].join(" ").toLowerCase().includes(query.trim().toLowerCase());
  });
  const resetFilters = () => {
    setCategory("All");
    setQuery("");
    search.current?.focus();
  };
  return /* @__PURE__ */ jsxs("div", { className: "ach-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "ach-wrap", children: [
      /* @__PURE__ */ jsx("header", { className: "ach-hero", "aria-labelledby": "ach-title", children: /* @__PURE__ */ jsx("h1", { id: "ach-title", children: "Achievements" }) }),
      /* @__PURE__ */ jsxs("section", { className: "ach-archive", id: "achievement-records", "aria-labelledby": "ach-records-title", children: [
        /* @__PURE__ */ jsx("h2", { className: "sr-only", id: "ach-records-title", children: "Member achievements" }),
        /* @__PURE__ */ jsxs("div", { className: "ach-tools", children: [
          /* @__PURE__ */ jsx("div", { className: "ach-filters", role: "group", "aria-label": "Filter achievements by category", children: categories.map((item) => /* @__PURE__ */ jsxs("button", { type: "button", "aria-pressed": activeCategory === item, onClick: () => setCategory(item), children: [
            item === "Competitive programming" ? "Programming" : item,
            /* @__PURE__ */ jsx("span", { children: number(item === "All" ? profiles.length : profiles.filter((profile) => profile.achievements.some((record) => record.category === item)).length) })
          ] }, item)) }),
          /* @__PURE__ */ jsxs("div", { className: "ach-search", children: [
            /* @__PURE__ */ jsx(Search, { size: 16, "aria-hidden": "true" }),
            /* @__PURE__ */ jsx("input", { ref: search, "aria-label": "Search achievements or members", type: "search", placeholder: "Search members or achievements", value: query, onChange: (event) => setQuery(event.target.value) }),
            query && /* @__PURE__ */ jsx("button", { type: "button", "aria-label": "Clear search", onClick: () => {
              setQuery("");
              search.current?.focus();
            }, children: /* @__PURE__ */ jsx(X, { size: 15 }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "ach-results-note", children: /* @__PURE__ */ jsx("span", { "aria-live": "polite", "aria-atomic": "true", children: visible.length === profiles.length ? `${number(profiles.length)} members` : `${number(visible.length)} of ${number(profiles.length)} members` }) }),
        /* @__PURE__ */ jsx("div", { className: "ach-records", children: visible.map((profile) => /* @__PURE__ */ jsxs("article", { className: "ach-record", children: [
          /* @__PURE__ */ jsxs("div", { className: "ach-record__topline", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "No. ",
              number(profiles.indexOf(profile) + 1)
            ] }),
            /* @__PURE__ */ jsx("span", { children: isPreview ? "SAMPLE RECORD" : "MEMBER RECORD" }),
            /* @__PURE__ */ jsx(Asterisk, { size: 15, "aria-hidden": "true" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "ach-record__person", children: [
            /* @__PURE__ */ jsx(MemberPortrait, { member: profile.member }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "ach-record__role", children: profile.member.role }),
              /* @__PURE__ */ jsx("h3", { children: profile.member.name })
            ] })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "ach-honours", children: profile.achievements.map((record) => /* @__PURE__ */ jsxs("li", { "data-category-match": activeCategory === "All" || record.category === activeCategory, children: [
            /* @__PURE__ */ jsx("span", { className: `ach-honours__symbol ach-honours__symbol--${record.category === "Hackathons" ? "award" : record.category === "Open source" ? "code" : record.category === "Research" ? "research" : "rank"}`, "aria-hidden": "true", children: record.category === "Hackathons" ? "✳" : record.category === "Open source" ? "↗" : record.category === "Research" ? "✦" : "#" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "ach-honours__title", children: [
                record.title,
                /* @__PURE__ */ jsxs("span", { children: [
                  "’",
                  record.year.slice(-2)
                ] })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "ach-honours__result", children: record.result })
            ] })
          ] }, record.id)) }),
          /* @__PURE__ */ jsxs("button", { type: "button", className: "ach-record__open", onClick: () => setSelected(profile), "aria-label": `View ${profile.member.name}'s achievements`, "aria-haspopup": "dialog", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              number(profile.achievements.length),
              " ",
              isPreview ? "sample achievements" : "achievements"
            ] }),
            /* @__PURE__ */ jsx("span", { className: "ach-record__arrow", "aria-hidden": "true", children: /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 }) })
          ] })
        ] }, profile.member.id)) }),
        !visible.length && /* @__PURE__ */ jsxs("div", { className: "ach-empty", children: [
          /* @__PURE__ */ jsx("h3", { children: profiles.length ? "No matching achievements." : "No achievements yet." }),
          profiles.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("p", { children: "Try another name or category." }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: resetFilters, children: [
              "Clear filters ",
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("footer", { className: "ach-footer", children: [
        /* @__PURE__ */ jsxs("a", { href: `mailto:${settings2.contactEmail}?subject=${encodeURIComponent("Nucleus achievement")}`, children: [
          "Submit an achievement ",
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 15 })
        ] }),
        /* @__PURE__ */ jsxs(Link, { to: "/team", children: [
          "Our team ",
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 15 })
        ] })
      ] })
    ] }),
    selected && /* @__PURE__ */ jsx(Modal, { title: selected.member.name, onClose: () => setSelected(null), children: /* @__PURE__ */ jsxs("div", { className: "ach-detail", children: [
      /* @__PURE__ */ jsxs("p", { className: "ach-detail__role", children: [
        selected.member.role,
        " · Nucleus SJEC"
      ] }),
      isPreview && /* @__PURE__ */ jsx("p", { className: "ach-preview", children: "SAMPLE ACHIEVEMENTS" }),
      /* @__PURE__ */ jsx("div", { className: "ach-detail__records", children: selected.achievements.map((record) => /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("div", { className: "ach-detail__meta", children: [
          /* @__PURE__ */ jsx("span", { children: record.category }),
          /* @__PURE__ */ jsx("span", { children: record.year })
        ] }),
        /* @__PURE__ */ jsx("h3", { children: record.title }),
        /* @__PURE__ */ jsx("span", { className: "ach-detail__result", children: record.result }),
        record.description && /* @__PURE__ */ jsx("p", { children: record.description }),
        record.href && /^https:\/\//.test(record.href) && /* @__PURE__ */ jsxs("a", { className: "ach-detail__link", href: record.href, target: "_blank", rel: "noreferrer", children: [
          "View the result ",
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 17 })
        ] })
      ] }, record.id)) })
    ] }) })
  ] });
}
const AchievementsPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AchievementsPage
}, Symbol.toStringTag, { value: "Module" }));
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});
function NewsCard({ item, priority = false }) {
  const titleId = useId();
  const [failedImage, setFailedImage] = useState(null);
  const imageAvailable = Boolean(item.image_url && failedImage !== item.image_url);
  const date = [item.date, item.created_at].filter(Boolean).map((value) => new Date(value)).find((value) => !Number.isNaN(value.getTime()));
  return /* @__PURE__ */ jsxs("article", { className: "news-card", "aria-labelledby": titleId, children: [
    /* @__PURE__ */ jsx("div", { className: "news-card__image", children: imageAvailable ? /* @__PURE__ */ jsx(
      "img",
      {
        src: item.image_url,
        alt: `Poster for ${item.title}`,
        width: 800,
        height: 600,
        loading: priority ? "eager" : "lazy",
        decoding: "async",
        onError: () => setFailedImage(item.image_url)
      }
    ) : /* @__PURE__ */ jsx("div", { className: "news-card__placeholder", "aria-hidden": "true", children: /* @__PURE__ */ jsx(Logo, {}) }) }),
    /* @__PURE__ */ jsxs("div", { className: "news-card__body", children: [
      date && /* @__PURE__ */ jsxs("time", { className: "news-card__date", dateTime: date.toISOString(), children: [
        /* @__PURE__ */ jsx(CalendarDays, { size: 13, "aria-hidden": "true" }),
        dateFormatter.format(date)
      ] }),
      /* @__PURE__ */ jsx("h3", { id: titleId, children: item.title }),
      item.description && /* @__PURE__ */ jsx("p", { className: "news-card__description", children: item.description })
    ] })
  ] });
}
async function fetchLiveNews(signal) {
  const { supabase: supabase2 } = await Promise.resolve().then(() => supabase$1);
  const { data, error } = await supabase2.from("live_news").select("id, title, description, image_url, date, created_at").order("created_at", { ascending: false }).order("id", { ascending: false }).abortSignal(signal).returns();
  if (error) throw error;
  return data ?? [];
}
function NewsSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "live-news__grid", "aria-hidden": "true", children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ jsxs("div", { className: "news-skeleton", children: [
    /* @__PURE__ */ jsx("div", { className: "news-skeleton__poster" }),
    /* @__PURE__ */ jsxs("div", { className: "news-skeleton__body", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {})
    ] })
  ] }, index)) });
}
function LiveNews() {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = window.setTimeout(() => {
      controller.abort();
      if (!disposed) setState({ status: "error", items: [] });
    }, 15e3);
    void fetchLiveNews(controller.signal).then((items) => {
      if (!disposed && !controller.signal.aborted) setState({ status: "ready", items });
    }).catch(() => {
      if (!disposed) setState({ status: "error", items: [] });
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);
  const retry = () => {
    setState({ status: "loading", items: [] });
    setAttempt((value) => value + 1);
  };
  return /* @__PURE__ */ jsx("section", { className: "live-news", "aria-labelledby": "live-news-title", children: /* @__PURE__ */ jsxs("div", { className: "live-news__wrap", children: [
    /* @__PURE__ */ jsx("header", { className: "live-news__hero", children: /* @__PURE__ */ jsx("h1", { id: "live-news-title", children: "Live news" }) }),
    /* @__PURE__ */ jsxs("section", { className: "live-news__feed", "aria-labelledby": "news-feed-title", "aria-busy": state.status === "loading", children: [
      /* @__PURE__ */ jsxs("div", { className: "live-news__feed-heading", children: [
        /* @__PURE__ */ jsx("h2", { id: "news-feed-title", children: "Latest updates" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(ArrowDownWideNarrow, { size: 14, "aria-hidden": "true" }),
          "Newest first"
        ] })
      ] }),
      state.status === "loading" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "sr-only", role: "status", children: "Loading the latest news…" }),
        /* @__PURE__ */ jsx(NewsSkeleton, {})
      ] }),
      state.status === "error" && /* @__PURE__ */ jsxs("div", { className: "live-news__state", children: [
        /* @__PURE__ */ jsx(Newspaper, { size: 30, "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs("div", { role: "alert", children: [
          /* @__PURE__ */ jsx("h3", { children: "The news couldn’t load." }),
          /* @__PURE__ */ jsx("p", { children: "Please try again in a moment." })
        ] }),
        /* @__PURE__ */ jsxs("button", { className: "live-news__retry", type: "button", onClick: retry, children: [
          /* @__PURE__ */ jsx(RefreshCw, { size: 15, "aria-hidden": "true" }),
          "Try again"
        ] })
      ] }),
      state.status === "ready" && (state.items.length ? /* @__PURE__ */ jsx("div", { className: "live-news__grid", children: state.items.map((item, index) => /* @__PURE__ */ jsx(NewsCard, { item, priority: index < 3 }, item.id)) }) : /* @__PURE__ */ jsxs("div", { className: "live-news__state", role: "status", children: [
        /* @__PURE__ */ jsx(Newspaper, { size: 30, "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("h3", { children: "No updates yet." })
      ] }))
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "live-news__footer", children: /* @__PURE__ */ jsxs("a", { href: "#live-news-title", children: [
      "Back to top",
      /* @__PURE__ */ jsx(ArrowUpRight, { size: 14, "aria-hidden": "true" })
    ] }) })
  ] }) });
}
const LiveNews$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LiveNews
}, Symbol.toStringTag, { value: "Module" }));
EventsPage$2.register(EventsPage);
WorkPage$2.register(WorkPage);
PeoplePage$2.register(PeoplePage);
Recruitment$2.register(Recruitment);
AchievementsPage$2.register(AchievementsPage);
LiveNews$2.register(LiveNews);
function render(data, url) {
  const sheet = new ServerStyleSheet();
  try {
    const markup = renderToString(sheet.collectStyles(/* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, { initialData: data }) })));
    return sheet.getStyleTags() + markup;
  } finally {
    sheet.seal();
  }
}
export {
  Book as B,
  api as a,
  createEventStations as c,
  populateWorkshopStation as p,
  render,
  sortTeamMembers as s,
  variants as v
};
