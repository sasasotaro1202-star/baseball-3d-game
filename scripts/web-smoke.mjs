import { readFileSync } from "node:fs";

const html = readFileSync("web/index.html", "utf8");
const js = readFileSync("web/src/main.js", "utf8");
const sim = readFileSync("web/src/game/simulation.js", "utf8");
const online = readFileSync("web/src/game/online.js", "utf8");
const ai = readFileSync("web/src/game/ai.js", "utf8");
const save = readFileSync("web/src/game/save.js", "utf8");
const presentation = readFileSync("web/src/game/presentation.js", "utf8");
const checks = [
  ["home screen", html.includes('id="home"')],
  ["match UI", html.includes('id="match-ui"')],
  ["readable match HUD", html.includes('id="away-score"') && html.includes('id="home-score"') && html.includes('id="count-label"') && html.includes('match-readability-v6')],
  ["compact pitch aim pad", html.includes('id="compact-aim-pad-v1"') && html.includes('width:210px') && html.includes('height:235px')],
  ["ProSpi-like course control", html.includes('id="prospi-like-match-ui-v3"') && html.includes('width:108px!important;height:146px!important') && html.includes('id="strike-zone"')],
  ["selected pitch state", js.includes('updatePitchControlUI') && js.includes('classList.toggle(\'selected\',selected)')],
  ["batting mode controls", html.includes('id="bat-mode-pill"') && html.includes('id="bat-contact-mode"') && html.includes('id="bat-power-mode"')],
  ["field-first match console", html.includes('id="match-console-v7"') && html.includes('.mph-top') && html.includes('.strike-zone') && html.includes('.match-action-pad')],
  ["AI match entry", html.includes('data-mode="ai-match"') && html.includes('AI戦')],
  ["AI difficulty", html.includes('data-ai-difficulty="EASY"') && html.includes('data-ai-difficulty="NORMAL"') && html.includes('data-ai-difficulty="HARD"') && ai.includes('AI_DIFFICULTIES')],
  ["online match entry", html.includes('data-mode="online-lobby"') && html.includes('オンライン戦')],
  ["P2P transport", js.includes("from './game/online.js'") && js.includes('createOnlineHost') && js.includes('createOnlineGuest') && js.includes('ONLINE_STATE') && js.includes('ONLINE_FIELDING_RESULT') && online.includes('ONLINE_FIELDING_RESULT')],
  ["pitcher substitution", sim.includes('advancePitcher') && sim.includes('pitcherIndex') && js.includes('advancePitcher')],
  ["fielding simulation", sim.includes('resolveFieldingPlay') && js.includes('resolveFieldingPlay')],
  ["fielding controls", html.includes('id="fielding-console"') && html.includes('id="fielding-pad"') && html.includes('data-throw-base="1"')],
  ["batting order state", sim.includes('batterIndex') && js.includes('match.batterIndex')],
  ["online signal encoder", online.includes('encodeSignal') && online.includes('replace(/\\+/g,"-")')],
  ["online role routing", js.includes('function isLocalBatter()') && js.includes('function isLocalPitcher()') && js.includes("matchMode==='ONLINE'")],
  ["manual fielding controls", html.includes('id="fielding-console"') && html.includes('id="fielding-pad"') && html.includes('data-throw-base="1"') && js.includes('function fieldingPadStart') && js.includes('function selectThrowBase')],
  ["steal control", html.includes('id="steal"') && js.includes('function performSteal')],
  ["pitcher stamina and rotation", sim.includes('pitcherStamina') && sim.includes('pitcherIndex') && sim.includes('advancePitcher')],
  ["GameState validator", sim.includes('isValidMatchState')],
  ["save versioning", save.includes('SAVE_VERSION=3') && save.includes('function migrate') && html.includes('settings-gameplay-v1')],
  ["phase-specific match UI", js.includes("matchUI.classList.toggle('batting-phase',batting)") && js.includes("matchUI.classList.toggle('pitching-phase',!batting)")],
  ["match score hierarchy", html.includes('id="away-score"') && html.includes('id="home-score"') && html.includes('id="count-label"')],
  ["pitch control", html.includes('id="pitch"')],
  ["swing control", html.includes('id="swing"')],
  ["Three.js import map", html.includes('"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"')],
  ["main controller", html.includes('src/main.js')],
  ["mobile manifest", html.includes('rel="manifest"')],
  ["runtime readiness flag", js.includes("window.__gameReady = true")],
  ["match simulation import", js.includes("resolvePitch")],
  ["live state assignment", js.includes("applyOutcome(match,outcome,") && js.includes("isValidMatchState(match)")],
  ["automatic AI pitching", js.includes("scheduleTopPitch(700)") && js.includes("count:[match.balls,match.strikes]")],
  ["match result persistence", js.includes("recordMatchResult") && js.includes("save.matches") && js.includes("save.wins")],
  ["persistent save", js.includes("loadSave")],
  ["premium UI v3", presentation.includes("premium-design-system-v3") && presentation.includes("premium-design-system-v3-hotfix")],
  ["vector navigation icons", html.includes('id="ui-icon-vector-v1"') && html.includes('ui-icon-scout') && html.includes('ui-icon-order')],
  ["scout premium hierarchy", js.includes("gacha-banner-kpis") && js.includes("gacha-feature-meta") && js.includes("OVR ")],
];
for (const [name, ok] of checks) {
  if (!ok) throw new Error("Smoke check failed: " + name);
}
console.log("Web smoke checks passed:", checks.map(([name]) => name).join(", "));
