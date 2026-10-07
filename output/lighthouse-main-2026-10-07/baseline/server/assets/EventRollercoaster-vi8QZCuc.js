import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useImperativeHandle, useMemo, useEffect, useCallback, Suspense, Component, lazy } from "react";
import { Image, Plus, Volume2, VolumeX, X, Route, Layers3, ArrowRight, ArrowUp, ArrowDown, Zap } from "lucide-react";
import { c as createEventStations, p as populateWorkshopStation, B as Book } from "../entry-server.js";
import { s as shouldShowJoystick } from "./event-quality-CCUjlSVB.js";
function windEnvelope(speed, active) {
  const pace = Math.min(1.6, Math.abs(Number.isFinite(speed) ? speed : 0));
  return { gain: 0.045 * Math.pow(pace / 1.6, 1.5), frequency: 220 + pace * 420 };
}
function createRideAudio() {
  const context = new AudioContext({ latencyHint: "playback" });
  const source = context.createBufferSource();
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  source.buffer = buffer;
  source.loop = true;
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 70;
  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 220;
  lowpass.Q.value = 0.5;
  const volume = context.createGain();
  volume.gain.value = 0;
  source.connect(highpass).connect(lowpass).connect(volume).connect(context.destination);
  source.start();
  let enabled = false, disposed = false, quieting = false, lastUpdate = -1, lastGain = 0;
  let suspension;
  let resuming;
  const cancelSuspension = () => {
    clearTimeout(suspension);
    suspension = void 0;
  };
  const resume = () => {
    if (context.state === "running") return Promise.resolve();
    return resuming ??= context.resume().finally(() => {
      resuming = void 0;
    });
  };
  function quiet() {
    if (disposed || quieting) return;
    quieting = true;
    lastGain = 0;
    lastUpdate = -1;
    volume.gain.setTargetAtTime(0, context.currentTime, 0.06);
    if (suspension === void 0) suspension = setTimeout(() => {
      suspension = void 0;
      if (!disposed) void context.suspend().catch(() => {
      });
    }, 300);
  }
  return {
    get running() {
      return context.state === "running";
    },
    get gain() {
      return lastGain;
    },
    async setEnabled(value) {
      if (disposed) return;
      enabled = value;
      if (!value) {
        quiet();
        return;
      }
      quieting = false;
      cancelSuspension();
      try {
        await resume();
      } catch (error) {
        enabled = false;
        throw error;
      }
    },
    update(speed, active) {
      if (disposed) return;
      if (!enabled || !active) {
        quiet();
        return;
      }
      quieting = false;
      cancelSuspension();
      if (context.state !== "running") {
        void resume().catch(() => {
          enabled = false;
        });
        return;
      }
      const now = context.currentTime;
      if (now - lastUpdate < 0.1) return;
      lastUpdate = now;
      const envelope = windEnvelope(speed);
      lastGain = envelope.gain;
      volume.gain.setTargetAtTime(envelope.gain, now, 0.22);
      lowpass.frequency.setTargetAtTime(envelope.frequency, now, 0.3);
    },
    quiet,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelSuspension();
      source.stop();
      source.disconnect();
      highpass.disconnect();
      lowpass.disconnect();
      volume.disconnect();
      void context.close().catch(() => {
      });
    }
  };
}
const GLIMPSE_EXIT = 8;
const GLIMPSE_FADE_IN = 1.2;
const GLIMPSE_ENLARGE = 2.6;
const GLIMPSE_HOLD = 0.8;
const GLIMPSE_FADE_OUT = 1.4;
const GLIMPSE_LIFETIME = GLIMPSE_FADE_IN + GLIMPSE_ENLARGE + GLIMPSE_HOLD + GLIMPSE_FADE_OUT;
const GLIMPSE_INTERVAL = GLIMPSE_LIFETIME + 0.4;
const GLIMPSE_SLOTS = 4;
const GLIMPSE_FADE = 0.9;
const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const ARRIVAL_TIME_SCALE = 0.72;
const STATION_PAN_SECONDS = 0.36;
const stationPanAngle = (progress) => progress <= 0 ? 0 : -Math.PI / 2 * (1 - Math.pow(1 - clamp(progress), 3));
function stationArrivalFrame(remaining, radius, reduced = false) {
  const proximity = Number.isFinite(remaining) && radius > 0 ? smooth(1 - Math.max(0, remaining) / radius) : 0;
  return {
    proximity,
    timeScale: reduced ? 1 : 1 - (1 - ARRIVAL_TIME_SCALE) * proximity,
    opacity: reduced ? 0 : smooth((proximity - 0.08) / 0.72),
    focus: reduced ? 0 : smooth((proximity - 0.15) / 0.85)
  };
}
function glimpseFrame(elapsed, slot, remaining) {
  const age = elapsed - slot * GLIMPSE_INTERVAL;
  const period = GLIMPSE_INTERVAL * GLIMPSE_SLOTS;
  const cycle = Math.max(0, Math.floor(age / period));
  const shotAge = age < 0 ? 0 : age % period;
  const fadeOutStart = GLIMPSE_LIFETIME - GLIMPSE_FADE_OUT;
  const fadeIn = smooth(shotAge / GLIMPSE_FADE_IN);
  const fadeOut = 1 - smooth((shotAge - fadeOutStart) / GLIMPSE_FADE_OUT);
  const proximityFade = smooth((remaining - GLIMPSE_EXIT) / 12);
  const opacity = age < 0 ? 0 : fadeIn * fadeOut * proximityFade;
  const photoIndex = (cycle + (shotAge >= GLIMPSE_LIFETIME ? 1 : 0)) * GLIMPSE_SLOTS + slot;
  return {
    photoIndex,
    opacity,
    // Complete the push-in before the hold, then dissolve without moving.
    scale: 0.96 + 0.29 * smooth((shotAge - GLIMPSE_FADE_IN) / GLIMPSE_ENLARGE)
  };
}
function cinematicCamera(speed, acceleration, slope, cruise, compact, reduced, boostFocus = 0) {
  const pace = Math.min(1.6, Math.abs(speed) / cruise);
  const focus = reduced ? 0 : clamp(boostFocus) * smooth(pace);
  return {
    // Give phones more breathing room, with bounded widening as speed increases.
    fov: (compact ? 105 : 68) + (reduced ? 0 : pace * (compact ? 4 : 6) + Math.max(0, -slope * Math.sign(speed)) * pace * (compact ? 2 : 3)) + focus * (compact ? 3 : 8),
    pullback: focus * (compact ? 0.4 : 0.7),
    lift: reduced ? 0 : Math.max(-0.1, Math.min(0.1, -acceleration * 6e-3)),
    pitch: reduced ? 0 : Math.max(-0.025, Math.min(0.025, acceleration * -18e-4)) * (compact ? 0.6 : 1),
    bankScale: (compact ? 0.55 : 0.85) * (1 - focus * 0.3)
  };
}
function GlimpsePhoto({ url, name }) {
  const [failed, setFailed] = useState(false);
  return url && !failed ? /* @__PURE__ */ jsx("img", { src: url, alt: name, decoding: "async", onError: () => setFailed(true) }) : /* @__PURE__ */ jsxs("div", { className: "nx-glimpse-placeholder", children: [
    /* @__PURE__ */ jsx(Image, { size: 27, strokeWidth: 1 }),
    /* @__PURE__ */ jsx("span", { children: "Photo coming soon" }),
    /* @__PURE__ */ jsx("i", { "aria-hidden": "true" })
  ] });
}
function RideGlimpses({ ref }) {
  const [station, setStation] = useState(null);
  const current = useRef(null);
  const container = useRef(null);
  const visibility = useRef(0);
  const elapsed = useRef(0);
  const [photos, setPhotos] = useState(() => Array.from({ length: GLIMPSE_SLOTS }, (_, i) => i));
  const photoIndices = useRef(photos);
  const frames = useRef([]);
  useImperativeHandle(ref, () => ({ update(next, remaining, seconds) {
    const step = Math.max(0, seconds) / GLIMPSE_FADE;
    visibility.current = next ? Math.min(1, visibility.current + step) : Math.max(0, visibility.current - step);
    if (container.current) {
      container.current.style.opacity = String(visibility.current);
      container.current.dataset.fading = String(!next && current.current !== null);
    }
    if (!next) {
      if (visibility.current === 0 && current.current) {
        current.current = null;
        setStation(null);
      }
      return;
    }
    if (current.current !== next) {
      current.current = next;
      elapsed.current = 0;
      setStation(next);
    }
    elapsed.current += Math.max(0, seconds);
    const poses = Array.from({ length: GLIMPSE_SLOTS }, (_, slot) => glimpseFrame(elapsed.current, slot, remaining));
    const indices = poses.map((pose) => pose.photoIndex);
    if (indices.some((index, slot) => index !== photoIndices.current[slot])) {
      photoIndices.current = indices;
      setPhotos(indices);
    }
    frames.current.forEach((element, slot) => {
      if (!element) return;
      const pose = poses[slot];
      element.style.opacity = String(pose.opacity);
      element.style.transform = `translate3d(0, -50%, 0) scale(${pose.scale})`;
      element.setAttribute("aria-hidden", String(pose.opacity === 0));
    });
  } }), []);
  return /* @__PURE__ */ jsx("aside", { ref: container, className: "nx-glimpses", hidden: !station, "aria-label": station ? `A glimpse of the next event: ${station.name}` : void 0, children: station && photos.map((photoIndex, slot) => {
    const album = station.event?.photos ?? [];
    const photo = album[photoIndex % album.length];
    return /* @__PURE__ */ jsxs("figure", { className: `nx-glimpse nx-glimpse-${photoIndex % 2 ? "right" : "left"}`, "data-frame": photoIndex, "aria-hidden": "true", ref: (element) => {
      frames.current[slot] = element;
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "nx-glimpse-photo", children: [
        /* @__PURE__ */ jsx(GlimpsePhoto, { url: photo?.url, name: photo?.name || station.name }, `${station.id}-${photo?.url ?? slot}`),
        /* @__PURE__ */ jsxs("span", { className: "nx-glimpse-index", "aria-hidden": "true", children: [
          photo ? `PHOTO ${String(photoIndex % album.length + 1).padStart(2, "0")}` : "NUCLEUS",
          /* @__PURE__ */ jsx("i", {})
        ] })
      ] }),
      /* @__PURE__ */ jsxs("figcaption", { children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "UP AHEAD ",
          /* @__PURE__ */ jsx("i", {}),
          " ",
          station.number
        ] }),
        /* @__PURE__ */ jsx("strong", { children: station.name }),
        /* @__PURE__ */ jsx("small", { children: station.event?.category || "The Nucleus collection" })
      ] })
    ] }, slot);
  }) });
}
function RideMap({ ref, layout, stations, ready, traveling, onTravel }) {
  const cart = useRef(null);
  useImperativeHandle(ref, () => ({ update(point) {
    cart.current?.setAttribute("transform", `translate(${point.x} ${point.y})`);
  } }), []);
  return /* @__PURE__ */ jsxs("nav", { className: "nx-minimap", "aria-label": "Ride route map", children: [
    /* @__PURE__ */ jsxs("div", { className: "nx-minimap-heading", children: [
      /* @__PURE__ */ jsx("span", { children: "THE LOOP" }),
      /* @__PURE__ */ jsx("i", { "aria-hidden": "true" }),
      "LIVE"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "nx-minimap-drawing", children: [
      /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 240 190", "aria-hidden": "true", children: [
        layout?.logo.map((path, i) => /* @__PURE__ */ jsx("path", { className: "nx-minimap-logo", d: path, fillRule: "evenodd" }, i)),
        layout && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("path", { className: "nx-minimap-track", d: layout.route }),
          /* @__PURE__ */ jsx("circle", { className: "nx-minimap-start", cx: layout.start.x, cy: layout.start.y, r: "3" }),
          /* @__PURE__ */ jsx("text", { x: layout.start.x + 7, y: layout.start.y + 4, children: "START" })
        ] }),
        /* @__PURE__ */ jsxs("g", { ref: cart, className: "nx-minimap-cart", transform: layout ? `translate(${layout.start.x} ${layout.start.y})` : void 0, children: [
          /* @__PURE__ */ jsx("circle", { r: "7" }),
          /* @__PURE__ */ jsx("circle", { r: "3" })
        ] })
      ] }),
      stations.map((station, index) => {
        const point = layout?.stations[index];
        return point && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled: !ready,
            "aria-label": `Travel to station ${station.number}: ${station.name}`,
            "aria-pressed": traveling === index,
            title: `Station ${station.number} · ${station.name}`,
            style: { left: `${point.x / 2.4}%`, top: `${point.y / 1.9}%` },
            onClick: () => onTravel(index),
            children: station.number
          },
          station.id
        );
      })
    ] }),
    /* @__PURE__ */ jsx("p", { "aria-live": "polite", children: traveling === null ? "Click a station to travel" : `Traveling to station ${stations[traveling]?.number}` })
  ] });
}
const LogoWorld = lazy(() => import("./LogoWorld-Bk6nGV95.js"));
const AddEventForm = lazy(() => import("./AddEventForm-BtOVSumT.js"));
class WorldBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function EventDialog({ children, label, onClose, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return /* @__PURE__ */ jsxs("dialog", { ref, className: "nx-dialog", "aria-label": label, "aria-busy": busy, onCancel: (event) => {
    event.preventDefault();
    if (!busy) onClose();
  }, children: [
    /* @__PURE__ */ jsx("button", { className: "nx-close", disabled: busy, onClick: onClose, "aria-label": "Close event", children: /* @__PURE__ */ jsx(X, { size: 18 }) }),
    children
  ] });
}
function Joystick({ input, disabled, onFocus }) {
  const active = useRef(null);
  const knob = useRef(null);
  const reset = useCallback(() => {
    active.current = null;
    input.current = { x: 0, y: 0 };
    if (knob.current) knob.current.style.transform = "translate(0, 0)";
  }, [input]);
  useEffect(() => {
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset();
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [reset]);
  useEffect(() => {
    if (disabled) reset();
  }, [disabled, reset]);
  function update(event) {
    if (active.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect(), radius = rect.width * 0.29;
    let x = event.clientX - rect.left - rect.width / 2, y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    if (distance > radius) {
      x *= radius / distance;
      y *= radius / distance;
    }
    input.current = { x: distance < 5 ? 0 : x / radius, y: distance < 5 ? 0 : -y / radius };
    if (knob.current) knob.current.style.transform = `translate(${x}px, ${y}px)`;
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: "nx-joystick",
      disabled,
      "aria-label": "Ride joystick. Drag up or right to accelerate; down or left to brake and reverse. You can also use W D and S A.",
      "aria-describedby": "nx-control-summary",
      title: "W / D to accelerate · S / A to brake and reverse",
      onPointerDown: (event) => {
        if (active.current !== null) return;
        event.preventDefault();
        onFocus();
        active.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      },
      onPointerMove: update,
      onPointerUp: reset,
      onPointerCancel: reset,
      onLostPointerCapture: reset,
      children: [
        /* @__PURE__ */ jsx("span", { className: "nx-joystick-track" }),
        /* @__PURE__ */ jsx(ArrowUp, { className: "nx-joystick-up", size: 13 }),
        /* @__PURE__ */ jsx(ArrowDown, { className: "nx-joystick-down", size: 13 }),
        /* @__PURE__ */ jsxs("span", { ref: knob, className: "nx-joystick-knob", children: [
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", {})
        ] })
      ]
    }
  );
}
function BoostControl({ input, active, disabled, touch, onFocus }) {
  const pointer = useRef(null);
  const reset = useCallback(() => {
    input.current = false;
    pointer.current = null;
  }, [input]);
  useEffect(() => {
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset();
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [reset]);
  useEffect(() => {
    if (disabled) reset();
  }, [disabled, reset]);
  return /* @__PURE__ */ jsxs(
    "button",
    {
      className: "nx-boost-button",
      type: "button",
      disabled,
      "aria-pressed": active,
      "aria-label": "Hold to boost. Keyboard shortcut: Shift.",
      onPointerDown: (event) => {
        if (event.button !== 0 || pointer.current !== null) return;
        event.preventDefault();
        onFocus();
        pointer.current = event.pointerId;
        event.currentTarget.setPointerCapture(event.pointerId);
        input.current = true;
      },
      onPointerUp: (event) => {
        if (event.pointerId === pointer.current) reset();
      },
      onPointerCancel: reset,
      onLostPointerCapture: reset,
      onBlur: reset,
      onKeyDown: (event) => {
        if (event.code === "Space" || event.code === "Enter") {
          event.preventDefault();
          input.current = true;
        }
      },
      onKeyUp: (event) => {
        if (event.code === "Space" || event.code === "Enter") {
          event.preventDefault();
          reset();
        }
      },
      children: [
        /* @__PURE__ */ jsx(Zap, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Boost" }),
        /* @__PURE__ */ jsx("small", { children: touch ? "HOLD" : "SHIFT" })
      ]
    }
  );
}
function EventRollercoaster({ events, onPublished, onReady }) {
  const eventKey = JSON.stringify(events);
  const stations = useMemo(() => createEventStations(events).map(populateWorkshopStation), [eventKey]);
  const [mapLayout, setMapLayout] = useState(null);
  const [traveling, setTraveling] = useState(null);
  const wrapper = useRef(null);
  const input = useRef({ x: 0, y: 0 });
  const boostInput = useRef(false);
  const audio = useRef(null);
  const [soundOn, setSoundOn] = useState(false), [soundBusy, setSoundBusy] = useState(false);
  const glimpses = useRef(null);
  const minimap = useRef(null);
  const [boosting, setBoosting] = useState(false);
  const [mode, setMode] = useState(typeof window !== "undefined" && window.innerWidth <= 768 ? "explore" : "overview");
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false), [reduced, setReduced] = useState(false);
  const [recovering, setRecovering] = useState(false);
  useEffect(() => {
    if (ready || failed) onReady?.();
  }, [ready, failed, onReady]);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false), [publishing, setPublishing] = useState(false), [listing, setListing] = useState(false);
  const [touchControls, setTouchControls] = useState(false), [notice, setNotice] = useState("");
  const [compactView, setCompactView] = useState(false);
  const [available, setAvailable] = useState([]);
  const onLayout = useCallback((layout, map) => {
    setAvailable(layout);
    setMapLayout(map);
  }, []);
  const paused = selected !== null || adding || listing;
  const [command, setCommand] = useState({ serial: 0, station: null });
  const station = selected === null ? null : stations[selected];
  useEffect(() => () => {
    audio.current?.dispose();
    audio.current = null;
  }, []);
  useEffect(() => {
    if (paused || failed || mode === "overview") audio.current?.quiet();
  }, [paused, failed, mode]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const pointer = window.matchMedia("(pointer: coarse)");
    const compact = window.matchMedia("(max-width: 768px), (max-height: 500px)");
    const update = () => {
      setTouchControls(shouldShowJoystick("ontouchstart" in window || navigator.maxTouchPoints > 0, pointer.matches, window.innerWidth));
      setCompactView(compact.matches);
    };
    update();
    pointer.addEventListener("change", update);
    window.addEventListener("resize", update, { passive: true });
    return () => {
      pointer.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const focusWorld = () => wrapper.current?.querySelector(".nx-world")?.focus({ preventScroll: true });
  async function toggleSound() {
    setSoundBusy(true);
    try {
      const sound = audio.current ??= createRideAudio();
      await sound.setEnabled(!soundOn);
      setSoundOn(!soundOn);
      if (mode === "explore") focusWorld();
    } catch {
      setSoundOn(false);
      setNotice("Sound is unavailable in this browser.");
    } finally {
      setSoundBusy(false);
    }
  }
  const selectStation = (index) => {
    input.current = { x: 0, y: 0 };
    setSelected(index);
  };
  const toggleMap = () => {
    input.current = { x: 0, y: 0 };
    setSelected(null);
    setMode((value) => value === "explore" ? "overview" : "explore");
  };
  const boardStation = (index) => {
    if (available[index] === false) {
      selectStation(index);
      return;
    }
    setCommand((value) => ({ serial: value.serial + 1, station: index, board: true }));
    setMode("explore");
    setSelected(null);
  };
  const travelToStation = (index) => {
    if (available[index] === false) {
      selectStation(index);
      return;
    }
    input.current = { x: 0, y: 0 };
    setSelected(null);
    setMode("explore");
    setCommand((value) => ({ serial: value.serial + 1, station: index, travel: true }));
  };
  const continueRide = useCallback((driveKey) => {
    if (!failed && (selected === null || available[selected] !== false)) {
      if (mode === "overview") {
        setCommand((value) => ({ serial: value.serial + 1, station: selected, driveKey }));
        setMode("explore");
      } else setCommand((value) => ({ serial: value.serial + 1, station: null, resume: true, driveKey }));
    }
    setSelected(null);
  }, [failed, mode, selected, available]);
  useEffect(() => {
    if (selected === null) return;
    const resume = (event) => {
      if (!event.defaultPrevented && ["KeyW", "KeyD", "KeyS", "KeyA"].includes(event.code) && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        continueRide(event.code);
      }
    };
    window.addEventListener("keydown", resume);
    return () => window.removeEventListener("keydown", resume);
  }, [selected, continueRide]);
  return /* @__PURE__ */ jsxs("section", { className: `nx-experience nx-${mode}`, ref: wrapper, "aria-label": "Nucleus roller coaster", "data-reduced-motion": reduced, "data-touch-controls": touchControls, children: [
    /* @__PURE__ */ jsx("h1", { className: "nx-sr-only", children: "Inside Nucleus" }),
    /* @__PURE__ */ jsxs("p", { id: "nx-control-summary", className: "nx-sr-only", children: [
      "Hold W or D to accelerate. S or A brakes and reverses. Hold Shift or the Boost button to speed up; release to return to cruising speed. Drag the scene to look around. Use the joystick on touchscreens. The track loops back to the start. The cart automatically stops at event stations, including while boosting. Close the event or press a drive key to continue. ",
      !compactView && "Click a checkpoint in the top-right route map to travel to that station automatically; a drive control takes over. ",
      "Open Map to select a station. On the full map, drag to orbit, right-drag or use two fingers to pan, and scroll or pinch to zoom."
    ] }),
    !failed && /* @__PURE__ */ jsx(WorldBoundary, { onError: () => setFailed(true), children: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(
      LogoWorld,
      {
        stations,
        mode,
        paused,
        reduced,
        input,
        boostInput,
        audio,
        glimpses,
        minimap,
        onTravelChange: setTraveling,
        onBoostChange: setBoosting,
        command,
        onLayout,
        onReady: () => {
          setReady(true);
          setRecovering(false);
        },
        onRecovering: setRecovering,
        onError: () => {
          setRecovering(false);
          setFailed(true);
        },
        onArrive: selectStation,
        onBoard: boardStation
      }
    ) }) }),
    /* @__PURE__ */ jsx("div", { className: "nx-vignette", "aria-hidden": "true" }),
    /* @__PURE__ */ jsx("div", { className: "nx-boost-focus", "aria-hidden": "true", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 1000 700", preserveAspectRatio: "none", children: /* @__PURE__ */ jsx("path", { d: "M-80 10 280 240 M60-40 330 220 M-70 220 250 290 M-60 540 280 420 M70 740 330 450 M250 760 400 480 M1080 10 720 240 M940-40 670 220 M1070 220 750 290 M1060 540 720 420 M930 740 670 450 M750 760 600 480" }) }) }),
    !compactView && /* @__PURE__ */ jsx(RideGlimpses, { ref: glimpses }),
    /* @__PURE__ */ jsxs("div", { className: "nx-topbar", children: [
      /* @__PURE__ */ jsxs("div", { className: "nx-ride-caption", children: [
        /* @__PURE__ */ jsx("span", { children: "THE LOGO LOOP" }),
        /* @__PURE__ */ jsx("small", { children: "Six passages. One endless journey." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "nx-event-actions", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          input.current = { x: 0, y: 0 };
          setListing(true);
        }, children: [
          "Events ",
          /* @__PURE__ */ jsx("span", { children: stations.length })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          input.current = { x: 0, y: 0 };
          setAdding(true);
        }, children: [
          /* @__PURE__ */ jsx(Plus, { size: 15 }),
          "Add Event"
        ] }),
        !failed && /* @__PURE__ */ jsxs("button", { className: "nx-sound-button", type: "button", "aria-label": "Wind sound", "aria-pressed": soundOn, title: soundOn ? "Mute wind sound" : "Enable wind sound", disabled: !ready || soundBusy, onClick: toggleSound, children: [
          soundOn ? /* @__PURE__ */ jsx(Volume2, { size: 16 }) : /* @__PURE__ */ jsx(VolumeX, { size: 16 }),
          /* @__PURE__ */ jsx("span", { children: "Sound" })
        ] })
      ] })
    ] }),
    !failed && !compactView && /* @__PURE__ */ jsx(RideMap, { ref: minimap, layout: mapLayout, stations, ready, traveling, onTravel: travelToStation }),
    notice && /* @__PURE__ */ jsxs("p", { className: "nx-publish-notice", role: "status", children: [
      notice,
      /* @__PURE__ */ jsx("button", { "aria-label": "Dismiss notification", onClick: () => setNotice(""), children: /* @__PURE__ */ jsx(X, { size: 14 }) })
    ] }),
    !ready && !failed && /* @__PURE__ */ jsxs("div", { className: "nx-loading", role: "status", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", { className: "nx-sr-only", children: "Loading the ride" })
    ] }),
    recovering && /* @__PURE__ */ jsxs("div", { className: "nx-loading", role: "status", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", { className: "nx-sr-only", children: "Reconnecting the ride. Your place is saved." })
    ] }),
    !failed && /* @__PURE__ */ jsxs("div", { className: "nx-controls", "aria-label": "Ride controls", children: [
      touchControls && mode === "explore" && /* @__PURE__ */ jsx(Joystick, { input, disabled: !ready || paused, onFocus: focusWorld }),
      !touchControls && /* @__PURE__ */ jsxs("p", { className: "nx-keyboard-hint", children: [
        mode === "overview" ? "Your journey starts at any checkpoint" : "W / D forward · S / A reverse",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { children: mode === "overview" ? "Select a station, then drive at your own pace" : "Drag to look · Release to coast" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "nx-ride-actions", children: [
        mode === "explore" && /* @__PURE__ */ jsx(BoostControl, { input: boostInput, active: boosting, disabled: !ready || paused, touch: touchControls, onFocus: focusWorld }),
        /* @__PURE__ */ jsxs("button", { className: "nx-map-button", onClick: toggleMap, disabled: !ready, "aria-pressed": mode === "overview", "aria-label": mode === "overview" ? "Return to ride" : "Open holographic map", children: [
          mode === "overview" ? /* @__PURE__ */ jsx(Route, { size: 17 }) : /* @__PURE__ */ jsx(Layers3, { size: 17 }),
          /* @__PURE__ */ jsx("span", { children: mode === "overview" ? "Ride" : "Map" })
        ] })
      ] })
    ] }),
    failed && /* @__PURE__ */ jsxs("div", { className: "nx-fallback", role: "status", children: [
      /* @__PURE__ */ jsx(Layers3, { size: 32 }),
      /* @__PURE__ */ jsx("h2", { children: "The ride is unavailable." }),
      /* @__PURE__ */ jsx("p", { children: "You can still explore the events." }),
      /* @__PURE__ */ jsx("div", { children: stations.map((item) => /* @__PURE__ */ jsxs("button", { onClick: () => selectStation(item.index), children: [
        /* @__PURE__ */ jsx("span", { children: item.number }),
        item.name,
        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
      ] }, item.id)) }),
      /* @__PURE__ */ jsx("a", { href: "/", children: "Back to Nucleus" })
    ] }),
    adding && /* @__PURE__ */ jsx(EventDialog, { label: "Add Event", busy: publishing, onClose: () => setAdding(false), children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("p", { role: "status", children: "Opening event form…" }), children: /* @__PURE__ */ jsx(AddEventForm, { stationNumber: String(stations.length + 1).padStart(2, "0"), onBusy: setPublishing, onPublished: (event) => {
      const added = createEventStations([...events.filter((item) => item.id !== event.id), event]).find((item) => item.id === event.id);
      onPublished(event);
      setAdding(false);
      setNotice(`“${event.title}” is published as Station ${added.number}. Find it on the map.`);
    } }) }) }),
    listing && /* @__PURE__ */ jsxs(EventDialog, { label: "Event stations", onClose: () => setListing(false), children: [
      /* @__PURE__ */ jsx("span", { className: "nx-event-category", children: "Explore every connection" }),
      /* @__PURE__ */ jsx("h2", { children: "Event stations" }),
      /* @__PURE__ */ jsx("div", { className: "nx-station-list", children: stations.map((item) => /* @__PURE__ */ jsxs("button", { onClick: () => {
        setListing(false);
        if (failed) selectStation(item.index);
        else boardStation(item.index);
      }, children: [
        /* @__PURE__ */ jsx("span", { children: item.number }),
        /* @__PURE__ */ jsxs("span", { children: [
          item.name,
          !item.event && /* @__PURE__ */ jsx("small", { children: "Preview station" }),
          available[item.index] === false && /* @__PURE__ */ jsx("small", { children: "Gallery only · track at capacity" })
        ] }),
        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
      ] }, item.id)) })
    ] }),
    station && /* @__PURE__ */ jsx(
      Book,
      {
        workshopFolder: station.workshop ?? station.id,
        imageList: station.event?.photos ?? [],
        title: station.name,
        stationNumber: station.number,
        event: station.event,
        onClose: () => continueRide(),
        galleryOnly: available[selected] === false,
        continueLabel: failed ? "Back to events" : mode === "overview" && available[selected] !== false ? "Ride from here" : "Continue ride"
      },
      station.id
    )
  ] });
}
const EventRollercoaster$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EventRollercoaster
}, Symbol.toStringTag, { value: "Module" }));
export {
  EventRollercoaster$1 as E,
  GLIMPSE_EXIT as G,
  STATION_PAN_SECONDS as S,
  stationArrivalFrame as a,
  cinematicCamera as c,
  stationPanAngle as s
};
