// frame-by-frame capture of the live site (mobile) with virtual time: 30 fps, deterministic
const { chromium } = require("playwright"); const fontroute = require("./fontroute"); const fs = require("fs");
const LANG = process.argv[2] || "ru", OUT = __dirname + "/cap/" + LANG;
const URL = "file://" + require("path").resolve(__dirname, "../site/index.html");
const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
(async () => {
  const b = await chromium.launch();
  async function session(hash) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
    await fontroute(ctx);
    await ctx.addInitScript(l => { try { localStorage.setItem("gr-lang", JSON.stringify(l)); } catch (e) {} }, LANG);
    const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
    await p.goto(URL + hash); await p.waitForTimeout(3800);
    await cdp.send("Emulation.setVirtualTimePolicy", { policy: "pause" });
    const step = ms => new Promise(res => { cdp.once("Emulation.virtualTimeBudgetExpired", res); cdp.send("Emulation.setVirtualTimePolicy", { policy: "advance", budget: ms }); });
    return { p, ctx, step };
  }
  async function shoot(s, dir, n, perFrame) {
    fs.mkdirSync(OUT + "/" + dir, { recursive: true });
    for (let i = 0; i < n; i++) {
      if (perFrame) await perFrame(i);
      await s.step(1000 / 30);
      await s.p.screenshot({ path: `${OUT}/${dir}/${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 90 });
    }
  }
  // A) home: hero, then scroll down to the globe
  let s = await session("");
  console.log("lang", await s.p.evaluate(() => document.documentElement.lang));
  const gy = await s.p.evaluate(() => { const e = document.querySelector(".stage"); return e.getBoundingClientRect().top + scrollY - (innerHeight - e.offsetHeight) / 2; });
  await shoot(s, "home", 165, async i => { const t = Math.max(0, Math.min(1, (i - 30) / 80)); await s.p.evaluate(y => window.scrollTo(0, y), Math.round(gy * ease(t))); });
  await s.ctx.close();
  // B) grants view: press "turn on radar", the sweep finds the scholarships
  s = await session("#grants");
  const ry = await s.p.evaluate(() => { const e = document.getElementById("pscope"); return e.getBoundingClientRect().top + scrollY - (innerHeight - e.offsetHeight) / 2 + 40; });
  await s.p.evaluate(y => window.scrollTo(0, y), Math.round(ry));
  await shoot(s, "radar", 200, async i => { if (i === 18) await s.p.evaluate(() => { const b = document.querySelector(".pstart"); if (b) b.click(); }); });
  // C) the data board right below the radar (flip animation runs when it scrolls into view)
  const by = await s.p.evaluate(() => { const e = document.getElementById("sync"); return e.getBoundingClientRect().top + scrollY - (innerHeight - e.offsetHeight) / 2; });
  await s.p.evaluate(y => window.scrollTo(0, y), Math.round(by));
  await s.p.evaluate(() => { /* replay the flip for the recording */ document.querySelectorAll("#sync .fl").forEach(f => f.classList.remove("flip")); });
  await shoot(s, "board", 120);
  // D) catalogue: region tabs and cards, slow scroll
  const ly = await s.p.evaluate(() => document.getElementById("regions").getBoundingClientRect().top + scrollY - 120);
  await shoot(s, "list", 135, async i => { await s.p.evaluate(y => window.scrollTo(0, y), Math.round(ly + 900 * ease(Math.min(1, i / 135)))); });
  await s.ctx.close(); await b.close(); console.log("done", LANG);
})();
