"""Собирает сайт из исходников: src/template.html + данные site/grants.json -> site/index.html.

Запуск из корня репозитория:  python3 src/build.py
После сборки:                 node scripts/check.js --sync
"""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(HERE, "assets")

def read(*p):
    return open(os.path.join(*p), encoding="utf-8").read()

# grants.json — единственный источник данных; в страницу встраивается запасная копия
data = json.load(open(os.path.join(ROOT, "site", "grants.json"), encoding="utf-8"))
block = ("/*GRANTS:START*/var G = " + json.dumps(data["grants"], ensure_ascii=False, separators=(",", ":")) +
         '; var CHECKED = "' + data["checked"] + '";/*GRANTS:END*/')

s = read(HERE, "template.html")
s = s.replace("/*@@FLAGS@@*/", read(HERE, "flags.js"))
s = s.replace("/*@@GRANTS@@*/", block)
s = s.replace("@@LAND@@", read(ASSETS, "land.b64").strip())
for key, name in [("CAP", "cap"), ("MAG", "magnifier"), ("CAL", "calendar"), ("ROCKET", "rocket"), ("PHOTO", "colonnade2")]:
    b = base64.b64encode(open(os.path.join(ASSETS, name + ".webp"), "rb").read()).decode()
    s = s.replace("@@IMG_" + key + "@@", "data:image/webp;base64," + b)
assert "@@" not in s, re.findall(r"@@\w+@@", s)

# опубликованная страница: SEO/OG-шапка + тело шаблона без его <title>
body = re.sub(r"<title>.*?</title>\s*", "", s, count=1, flags=re.S)
out = os.path.join(ROOT, "site", "index.html")
open(out, "w", encoding="utf-8").write(read(HERE, "site-head.html") + body + "\n</body>\n</html>\n")
print("site/index.html:", len(open(out, "rb").read()) // 1024, "KB")
