const { chromium } = require("playwright");
(async () => {
  const lang = process.argv[2] || "ru"; const T = (process.argv[3] || "0.8,1.5,3.6,4.7,6.0,7.3,8.9,11.5,15.6,19.5,22.0,24.3,26.5,30.0,33.0,35.5").split(",").map(Number);
  const b = await chromium.launch({ args: ["--allow-file-access-from-files"] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto("file://" + __dirname + "/" + (process.env.PAGE || "compose.html") + "?lang=" + lang); await p.evaluate(() => window.READY);
  for (const t of T) { await p.evaluate(t => window.renderAt(t), t); await p.screenshot({ path: __dirname + "/pv/" + lang + "_" + t.toFixed(1) + ".jpg", type: "jpeg", quality: 80 }); }
  console.log(errs.length ? errs.slice(0, 5) : "no errors"); await b.close();
})();
