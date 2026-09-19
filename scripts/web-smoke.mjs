import { readFileSync } from "node:fs";

const html = readFileSync("web/index.html", "utf8");
const js = readFileSync("web/src/main.js", "utf8");
const checks = [
  ["home screen", html.includes('id="home"')],
  ["match UI", html.includes('id="match-ui"')],
  ["pitch control", html.includes('id="pitch"')],
  ["swing control", html.includes('id="swing"')],
  ["Three.js import map", html.includes('"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"')],
  ["main controller", html.includes('src/main.js')],
  ["mobile manifest", html.includes('rel="manifest"')],
  ["runtime readiness flag", js.includes("window.__gameReady = true")],
  ["match simulation import", js.includes("resolvePitch")],
  ["persistent save", js.includes("loadSave")],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error("Smoke check failed: " + name);
}
console.log("Web smoke checks passed:", checks.map(([name]) => name).join(", "));
