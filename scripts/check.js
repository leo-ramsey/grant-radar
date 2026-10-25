#!/usr/bin/env node
// Проверка site/grants.json перед публикацией.
//   node scripts/check.js         — только проверить
//   node scripts/check.js --sync  — проверить и обновить запасную копию данных внутри site/index.html
// При ошибках выходит с кодом 1: Netlify не опубликует сломанные данные, сайт останется прежним.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "site", "grants.json");
const PAGE = path.join(ROOT, "site", "index.html");

const LANGS = ["ru", "uz", "en"];
const FLAGS = ["UZ", "GB", "TR", "HU", "KR", "JP", "CN", "EU", "SE", "DE", "KG", "RU", "US", "FR", "IT", "IE", "NL", "IN", "HK"]; // флаги, нарисованные на сайте
const LEVELS = ["ba", "ma", "phd", "ex"];
const FUNDS = ["full", "partial", "stipend", "tuition"];
const CYCLE_LEVELS = ["ba", "grad"];
const GRANT_KEYS = ["id", "cc", "lv", "fund", "ielts", "ieltsTxt", "cycles", "rolling", "link", "country", "name", "sum", "cov", "req", "note"];
const CYCLE_KEYS = ["o", "c", "a", "ao", "ac", "l"];

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(where + ": " + msg);
const warn = (where, msg) => warnings.push(where + ": " + msg);

function isDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
}
const okText = (v) => typeof v === "string" && v.trim().length > 0;
function checkText(where, v, allowPlain) {
  if (allowPlain && okText(v)) return;
  if (!v || typeof v !== "object") return err(where, allowPlain ? "нужна строка или {ru, uz, en}" : "нужен объект {ru, uz, en}");
  LANGS.forEach((l) => { if (!okText(v[l])) err(where, "нет текста на «" + l + "»"); });
}
function checkList(where, v) {
  if (!v || typeof v !== "object") return err(where, "нужен объект {ru: [...], uz: [...], en: [...]}");
  LANGS.forEach((l) => {
    if (!Array.isArray(v[l]) || !v[l].length || !v[l].every(okText)) err(where, "нужен непустой список строк на «" + l + "»");
  });
  const n = LANGS.map((l) => (Array.isArray(v[l]) ? v[l].length : 0));
  if (new Set(n).size > 1) warn(where, "разное число пунктов по языкам: " + n.join("/"));
}

let raw;
try { raw = fs.readFileSync(DATA, "utf8"); } catch (e) { console.error("Не найден " + DATA); process.exit(1); }
let data;
try { data = JSON.parse(raw); } catch (e) { console.error("grants.json — не валидный JSON: " + e.message); process.exit(1); }

if (/[<>]/.test(raw)) err("grants.json", "символы < и > запрещены (защита от вставки HTML)");
if (/javascript:/i.test(raw)) err("grants.json", "строка «javascript:» запрещена");
if (!isDate(data.checked)) err("checked", "нужна дата в формате ГГГГ-ММ-ДД");
if (!Array.isArray(data.grants) || !data.grants.length) err("grants", "нужен непустой массив программ");

const today = new Date().toISOString().slice(0, 10);
if (isDate(data.checked) && data.checked > today) err("checked", "дата проверки в будущем");

const ids = new Set();
(data.grants || []).forEach((g, i) => {
  const w = "grants[" + i + "]" + (g && g.id ? " (" + g.id + ")" : "");
  if (!g || typeof g !== "object") return err(w, "не объект");
  Object.keys(g).forEach((k) => { if (!GRANT_KEYS.includes(k)) warn(w, "неизвестное поле «" + k + "» — сайт его не покажет"); });

  if (typeof g.id !== "string" || !/^[a-z0-9-]+$/.test(g.id)) err(w, "id: только латиница в нижнем регистре, цифры и дефис");
  else if (ids.has(g.id)) err(w, "id повторяется");
  else ids.add(g.id);

  if (!FLAGS.includes(g.cc)) err(w, "cc «" + g.cc + "»: для этой страны на сайте нет флага. Новую страну добавляет человек вручную");
  if (!Array.isArray(g.lv) || !g.lv.length || !g.lv.every((x) => LEVELS.includes(x))) err(w, "lv: непустой список из " + LEVELS.join(", "));
  if (!FUNDS.includes(g.fund)) err(w, "fund: одно из " + FUNDS.join(", "));
  if (!(g.ielts === null || (typeof g.ielts === "number" && g.ielts >= 0 && g.ielts <= 9))) err(w, "ielts: число 0–9 (0 = не нужен) или null (по-разному)");
  if (g.ieltsTxt !== undefined) checkText(w + " ieltsTxt", g.ieltsTxt, false);
  if (typeof g.link !== "string" || !/^https:\/\/[^\s"']+$/.test(g.link)) err(w, "link: нужна ссылка https://");

  checkText(w + " name", g.name, true);
  checkText(w + " country", g.country, true);
  checkText(w + " sum", g.sum, true);
  checkText(w + " note", g.note, true);
  checkList(w + " cov", g.cov);
  checkList(w + " req", g.req);

  if (g.rolling !== undefined && g.rolling !== true) err(w, "rolling: либо true, либо поле отсутствует");
  if (!Array.isArray(g.cycles)) return err(w, "cycles: нужен массив");
  if (!g.rolling && !g.cycles.length) err(w, "cycles: нужен хотя бы один приём (или rolling: true)");
  g.cycles.forEach((c, j) => {
    const cw = w + " cycles[" + j + "]";
    if (!c || typeof c !== "object") return err(cw, "не объект");
    Object.keys(c).forEach((k) => { if (!CYCLE_KEYS.includes(k)) err(cw, "неизвестное поле «" + k + "»"); });
    if (!isDate(c.o)) err(cw, "o (открытие): дата ГГГГ-ММ-ДД");
    if (!isDate(c.c)) err(cw, "c (закрытие): дата ГГГГ-ММ-ДД");
    if (isDate(c.o) && isDate(c.c)) {
      if (c.o > c.c) err(cw, "открытие позже закрытия");
      if (c.o < "2024-01-01" || c.c > "2030-12-31") err(cw, "дата вне 2024–2030");
    }
    ["a", "ao", "ac"].forEach((k) => { if (c[k] !== undefined && c[k] !== 1) err(cw, k + ": либо 1, либо поле отсутствует"); });
    if (c.l !== undefined && !CYCLE_LEVELS.includes(c.l)) err(cw, "l: одно из " + CYCLE_LEVELS.join(", "));
  });
  if (!g.rolling && g.cycles.length && g.cycles.every((c) => isDate(c.c) && c.c < today)) {
    warn(w, "все приёмы уже прошли — сайт покажет ориентировочные даты на следующий год, но лучше добавить новый цикл");
  }
});

warnings.forEach((m) => console.log("⚠ " + m));
if (errors.length) {
  errors.forEach((m) => console.log("✗ " + m));
  console.log("\nОшибок: " + errors.length + ". Данные НЕ опубликованы.");
  process.exit(1);
}
console.log("✓ grants.json в порядке: " + data.grants.length + " программ, проверено " + data.checked + (warnings.length ? ", предупреждений: " + warnings.length : ""));

if (process.argv.includes("--sync")) {
  const page = fs.readFileSync(PAGE, "utf8");
  const re = /\/\*GRANTS:START\*\/[\s\S]*?\/\*GRANTS:END\*\//;
  if (!re.test(page)) { console.log("✗ В site/index.html не найдены метки GRANTS:START/END"); process.exit(1); }
  const block = "/*GRANTS:START*/var G = " + JSON.stringify(data.grants) + '; var CHECKED = "' + data.checked + '";/*GRANTS:END*/';
  const next = page.replace(re, () => block);
  if (next !== page) { fs.writeFileSync(PAGE, next); console.log("✓ Запасная копия данных в site/index.html обновлена"); }
  else console.log("✓ Запасная копия данных уже актуальна");
}
