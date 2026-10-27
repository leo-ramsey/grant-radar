// serves Google Fonts requests from the local font files so captures match the live site
const fs = require("fs"), path = require("path");
const F = path.join(__dirname, "fonts");
const css = `
@font-face{font-family:'Unbounded';font-weight:200 900;font-style:normal;src:url(https://fonts.gstatic.com/local/Unbounded.ttf) format('truetype')}
@font-face{font-family:'Onest';font-weight:100 900;font-style:normal;src:url(https://fonts.gstatic.com/local/Onest.ttf) format('truetype')}
@font-face{font-family:'JetBrains Mono';font-weight:100 800;font-style:normal;src:url(https://fonts.gstatic.com/local/JBM.ttf) format('truetype')}
@font-face{font-family:'Cormorant Garamond';font-weight:300 700;font-style:italic;src:url(https://fonts.gstatic.com/local/CGI.ttf) format('truetype')}`;
const files = { "Unbounded.ttf": "Unbounded[wght].ttf", "Onest.ttf": "Onest[wght].ttf", "JBM.ttf": "JetBrainsMono[wght].ttf", "CGI.ttf": "CormorantGaramond-Italic[wght].ttf" };
module.exports = async function (ctx) {
  await ctx.route("https://fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: css }));
  await ctx.route("https://fonts.gstatic.com/**", r => {
    const n = r.request().url().split("/").pop();
    if (files[n]) return r.fulfill({ status: 200, contentType: "font/ttf", body: fs.readFileSync(path.join(F, files[n])), headers: { "access-control-allow-origin": "*" } });
    return r.abort();
  });
};
