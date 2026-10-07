import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { ArrowRight, FolderPlus } from "lucide-react";
import { a as api } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom/server.mjs";
import "styled-components";
import "react-router-dom";
import "framer-motion";
import "react-dom";
import "@supabase/supabase-js";
import "clsx";
import "tailwind-merge";
import "@studio-freight/lenis";
import "gsap";
const MAX_EVENT_PHOTOS = 20;
const isEventPhoto = (file) => /^(image\/(jpeg|png|webp|avif))$/.test(file.type) || !file.type && /\.(jpe?g|png|webp|avif)$/i.test(file.name);
async function prepareEventPhotos(files, progress) {
  if (files.length > MAX_EVENT_PHOTOS) throw new Error("Choose up to 20 photos.");
  if (files.reduce((total, file) => total + file.size, 0) > 8e7) throw new Error("Choose a folder smaller than 80 MB.");
  const photos = [];
  let totalBytes = 0;
  for (const [index, file] of files.entries()) {
    if (!isEventPhoto(file) || file.size > 12e6) throw new Error(`${file.name}: choose a JPG, PNG, WebP or AVIF image under 12 MB.`);
    progress(`Preparing photo ${index + 1} of ${files.length}…`);
    const bitmap = await createImageBitmap(file).catch(() => {
      throw new Error(`${file.name} could not be read. Remove it or choose another photo.`);
    });
    try {
      const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Photo processing is unavailable in this browser.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let encoded = "";
      for (const quality of [0.8, 0.65, 0.45]) {
        const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not process this photo.")), "image/webp", quality));
        if (blob.size > 5e5) continue;
        totalBytes += blob.size;
        encoded = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        break;
      }
      if (!encoded) throw new Error(`${file.name} is too detailed. Choose a smaller version.`);
      if (totalBytes > 6e6) throw new Error("The album is too large. Choose fewer photos (6 MB after compression).");
      photos.push({ name: file.name.slice(0, 180), mime: encoded.slice(5, encoded.indexOf(";")), data: encoded.slice(encoded.indexOf(",") + 1) });
      canvas.width = canvas.height = 1;
    } finally {
      bitmap.close();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return photos;
}
function AddEventForm({ onPublished, onBusy, stationNumber }) {
  const [session, setSession] = useState(null), [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [progress, setProgress] = useState("");
  const [files, setFiles] = useState([]), [skipped, setSkipped] = useState(0);
  const id = useRef(crypto.randomUUID());
  useEffect(() => {
    const abort = new AbortController();
    api("/admin/session", { signal: abort.signal }).then(setSession).catch(() => {
    }).finally(() => {
      if (!abort.signal.aborted) setChecking(false);
    });
    return () => abort.abort();
  }, []);
  function working(value) {
    setBusy(value);
    onBusy(value);
  }
  async function login(event) {
    event.preventDefault();
    working(true);
    setError("");
    const fields = new FormData(event.currentTarget);
    try {
      setSession(await api("/admin/login", { method: "POST", body: JSON.stringify({ email: fields.get("email"), password: fields.get("password") }) }));
    } catch (error2) {
      setError(error2.message);
    } finally {
      working(false);
    }
  }
  async function publish(event) {
    event.preventDefault();
    if (!session || busy) return;
    const fields = new FormData(event.currentTarget);
    working(true);
    setError("");
    try {
      const photos = await prepareEventPhotos(files, setProgress);
      const details = {
        title: String(fields.get("title")).trim(),
        description: String(fields.get("description")).trim(),
        startsAt: new Date(String(fields.get("startsAt"))).toISOString(),
        endsAt: "",
        category: String(fields.get("category")).trim(),
        location: String(fields.get("location")).trim(),
        albumUrl: String(fields.get("albumUrl") || "").trim(),
        registrationUrl: String(fields.get("registrationUrl") || "").trim(),
        published: true
      };
      setProgress("Publishing event and placing its station…");
      const saved = await api(`/admin/experience-events/${id.current}`, { method: "PUT", headers: { "X-CSRF-Token": session.csrf }, body: JSON.stringify({ event: details, photos }) });
      onPublished(saved);
    } catch (error2) {
      const message = error2.message;
      setError(message);
      if (/sign in|session/i.test(message)) setSession(null);
    } finally {
      working(false);
      setProgress("");
    }
  }
  function choose(list) {
    const all = Array.from(list ?? []), photos = all.filter(isEventPhoto).sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name));
    setFiles(photos);
    setSkipped(all.length - photos.length);
    setError(photos.length > 20 ? "Choose a folder with up to 20 photos, or select individual photos." : "");
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "nx-event-category", children: "A new stop on the journey" }),
    /* @__PURE__ */ jsx("h2", { children: "Add Event" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "Your event becomes Station ",
      stationNumber,
      " on the Nucleus Ride. Existing stations stay in place. Upload photos for its comic book, add an album link, or publish with just the story."
    ] }),
    checking && /* @__PURE__ */ jsx("p", { role: "status", children: "Checking admin access…" }),
    !checking && !session && /* @__PURE__ */ jsxs("form", { className: "nx-event-form", onSubmit: login, children: [
      /* @__PURE__ */ jsx("p", { children: "Sign in with your Nucleus administrator account." }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Email",
        /* @__PURE__ */ jsx("input", { name: "email", type: "email", autoComplete: "username", required: true, maxLength: 254 })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Password",
        /* @__PURE__ */ jsx("input", { name: "password", type: "password", autoComplete: "current-password", required: true, maxLength: 256 })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "nx-continue", disabled: busy, children: [
        busy ? "Signing in…" : "Sign in",
        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "nx-event-form", onSubmit: publish, hidden: !session, children: [
      /* @__PURE__ */ jsxs("label", { children: [
        "Event title",
        /* @__PURE__ */ jsx("input", { name: "title", required: true, minLength: 2, maxLength: 120, placeholder: "Give this connection a name" })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Event details",
        /* @__PURE__ */ jsx("textarea", { name: "description", required: true, minLength: 20, maxLength: 1600, rows: 5, placeholder: "Paste the event story, highlights and details…" })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Date and time (your local timezone)",
        /* @__PURE__ */ jsx("input", { name: "startsAt", type: "datetime-local", required: true })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Location",
        /* @__PURE__ */ jsx("input", { name: "location", required: true, minLength: 2, maxLength: 200, placeholder: "Venue or online" })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Category",
        /* @__PURE__ */ jsx("input", { name: "category", required: true, minLength: 2, maxLength: 60, placeholder: "Workshop, community, hackathon…" })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Photo album link (Google Drive or any share URL)",
        /* @__PURE__ */ jsx("input", { name: "albumUrl", type: "url", placeholder: "https://drive.google.com/…" }),
        /* @__PURE__ */ jsx("small", { children: "Optional. Use a share link your visitors can open." })
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        "Registration link",
        /* @__PURE__ */ jsx("input", { name: "registrationUrl", type: "url", placeholder: "https://…" }),
        /* @__PURE__ */ jsx("small", { children: "Optional. Link to the event registration form." })
      ] }),
      /* @__PURE__ */ jsxs("fieldset", { disabled: busy, children: [
        /* @__PURE__ */ jsxs("legend", { children: [
          /* @__PURE__ */ jsx(FolderPlus, { size: 16 }),
          " Photos (optional)"
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Upload a folder",
          /* @__PURE__ */ jsx("input", { type: "file", "aria-label": "Upload a photo folder", ref: (element) => {
            element?.setAttribute("webkitdirectory", "");
          }, multiple: true, onChange: (event) => choose(event.currentTarget.files) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Or select photos",
          /* @__PURE__ */ jsx("input", { type: "file", "aria-label": "Select event photos", accept: "image/jpeg,image/png,image/webp,image/avif", multiple: true, onChange: (event) => choose(event.currentTarget.files) })
        ] }),
        /* @__PURE__ */ jsx("small", { children: "Up to 20 photos, 12 MB each. JPG, PNG, WebP or AVIF. Photos are resized for the gallery." }),
        !!files.length && /* @__PURE__ */ jsxs("p", { children: [
          files.length,
          " photo",
          files.length === 1 ? "" : "s",
          " selected ",
          /* @__PURE__ */ jsx("button", { className: "nx-text-button", type: "button", onClick: () => setFiles([]), children: "Clear" })
        ] }),
        !!skipped && /* @__PURE__ */ jsxs("small", { children: [
          skipped,
          " unsupported file",
          skipped === 1 ? "" : "s",
          " skipped."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("button", { className: "nx-continue", disabled: busy || files.length > 20, children: [
        busy ? "Publishing…" : "Publish event & add station",
        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
      ] })
    ] }),
    progress && /* @__PURE__ */ jsx("p", { className: "nx-form-status", role: "status", children: progress }),
    error && /* @__PURE__ */ jsx("p", { className: "nx-form-error", role: "alert", children: error })
  ] });
}
export {
  AddEventForm as default
};
