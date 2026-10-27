const { chromium } = require("playwright"); const fs = require("fs");
(async () => {
  const lang = process.argv[2], FPS = 30, DUR = +(process.env.DUR || 36), N = FPS * DUR, OUT = __dirname + "/frames/" + (process.env.TAG || lang);
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("file://" + __dirname + "/" + (process.env.PAGE || "compose.html") + "?lang=" + lang); await p.evaluate(() => window.READY);
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => window.renderAt(t), f / FPS);
    await p.screenshot({ path: `${OUT}/${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 93 });
  }
  console.log(lang, "frames", N, "in", Math.round((Date.now() - t0) / 1000), "s", errs.length ? errs.slice(0, 3) : "no errors"); await b.close();
})();
