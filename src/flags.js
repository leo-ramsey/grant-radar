  /* ---------- Flags (inline SVG; emoji flags do not render on Windows) ---------- */
  function star(cx, cy, R, r, n, rot) {
    var pts = [];
    for (var i = 0; i < n * 2; i++) {
      var rr = i % 2 ? r : R, ang = (rot + i * 180 / n) * Math.PI / 180;
      pts.push((cx + rr * Math.cos(ang)).toFixed(2) + "," + (cy + rr * Math.sin(ang)).toFixed(2));
    }
    return '<polygon points="' + pts.join(" ") + '"/>';
  }
  function stripes(colors) {
    var h = 20 / colors.length;
    return colors.map(function (c, i) { return '<rect y="' + (i * h) + '" width="30" height="' + (h + .05) + '" fill="' + c + '"/>'; }).join("");
  }
  function vstripes(colors) {
    var w = 30 / colors.length;
    return colors.map(function (c, i) { return '<rect x="' + (i * w) + '" width="' + (w + .05) + '" height="20" fill="' + c + '"/>'; }).join("");
  }
  var uid = 0;
  var FLAGS = {
    UZ: function () {
      var s = "", rows = [[1.6, [10.6, 12, 13.4]], [3.2, [9.2, 10.6, 12, 13.4]], [4.8, [7.8, 9.2, 10.6, 12, 13.4]]];
      rows.forEach(function (r) { r[1].forEach(function (x) { s += star(x, r[0], .55, .22, 5, -90); }); });
      return '<rect width="30" height="6.4" fill="#0099B5"/><rect y="6.4" width="30" height=".4" fill="#CE1126"/><rect y="6.8" width="30" height="6.4" fill="#FFFFFF"/>' +
        '<rect y="13.2" width="30" height=".4" fill="#CE1126"/><rect y="13.6" width="30" height="6.4" fill="#1EB53A"/>' +
        '<circle cx="4.4" cy="3.2" r="2.3" fill="#FFFFFF"/><circle cx="5.3" cy="3.2" r="2" fill="#0099B5"/><g fill="#FFFFFF">' + s + "</g>";
    },
    GB: function (id) {
      return '<clipPath id="gbt' + id + '"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>' +
        '<rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6"/>' +
        '<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#gbt' + id + ')" stroke="#C8102E" stroke-width="4"/>' +
        '<path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>';
    },
    TR: function () {
      return '<rect width="30" height="20" fill="#E30A17"/><circle cx="10.5" cy="10" r="5" fill="#FFFFFF"/><circle cx="11.75" cy="10" r="4" fill="#E30A17"/>' +
        '<g fill="#FFFFFF">' + star(16.4, 10, 2.5, 1, 5, 180) + "</g>";
    },
    HU: function () { return stripes(["#CE2939", "#FFFFFF", "#477050"]); },
    KR: function () {
      var tri = "";
      [-56.31, 56.31, 123.69, -123.69].forEach(function (a) {
        tri += '<g transform="rotate(' + a + ' 15 10)" fill="#000000"><rect x="13.4" y="1.6" width="3.2" height=".6"/><rect x="13.4" y="2.5" width="3.2" height=".6"/><rect x="13.4" y="3.4" width="3.2" height=".6"/></g>';
      });
      return '<rect width="30" height="20" fill="#FFFFFF"/><g transform="rotate(33.69 15 10)"><circle cx="15" cy="10" r="5" fill="#0047A0"/>' +
        '<path d="M10,10 A5,5 0 0 1 20,10 A2.5,2.5 0 0 1 15,10 A2.5,2.5 0 0 0 10,10 Z" fill="#CD2E3A"/></g>' + tri;
    },
    JP: function () { return '<rect width="30" height="20" fill="#FFFFFF"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>'; },
    CN: function () {
      return '<rect width="30" height="20" fill="#EE1C25"/><g fill="#FFFF00">' + star(5, 5, 3, 1.15, 5, -90) +
        star(10, 2, 1, .38, 5, -60) + star(12, 4, 1, .38, 5, -75) + star(12, 7, 1, .38, 5, -100) + star(10, 9, 1, .38, 5, -120) + "</g>";
    },
    EU: function () {
      var s = "";
      for (var i = 0; i < 12; i++) { var a = i * 30 * Math.PI / 180; s += star(15 + 6.4 * Math.sin(a), 10 - 6.4 * Math.cos(a), 1, .4, 5, -90); }
      return '<rect width="30" height="20" fill="#003399"/><g fill="#FFCC00">' + s + "</g>";
    },
    SE: function () { return '<rect width="30" height="20" fill="#006AA7"/><rect x="9.4" width="3.75" height="20" fill="#FECC00"/><rect y="8" width="30" height="4" fill="#FECC00"/>'; },
    DE: function () { return stripes(["#000000", "#DD0000", "#FFCE00"]); },
    KG: function () {
      return '<rect width="30" height="20" fill="#E8112D"/><g fill="#FFEF00">' + star(15, 10, 6.2, 4.3, 40, -90) + '<circle cx="15" cy="10" r="3.6"/></g>' +
        '<g fill="none" stroke="#E8112D" stroke-width=".55"><circle cx="15" cy="10" r="2.7"/><path d="M12.6,8.9 Q15,10.2 17.4,8.9 M12.6,11.1 Q15,9.8 17.4,11.1 M13.2,7.9 Q15,11.5 16.8,12.1 M16.8,7.9 Q15,11.5 13.2,12.1"/></g>';
    },
    RU: function () { return stripes(["#FFFFFF", "#0039A6", "#D52B1E"]); },
    FR: function () { return vstripes(["#002395", "#FFFFFF", "#ED2939"]); },
    IT: function () { return vstripes(["#009246", "#FFFFFF", "#CE2B37"]); },
    IE: function () { return vstripes(["#169B62", "#FFFFFF", "#FF883E"]); },
    NL: function () { return stripes(["#AE1C28", "#FFFFFF", "#21468B"]); },
    IN: function () {
      var sp = "";
      for (var i = 0; i < 12; i++) { var a = i * 15 * Math.PI / 180; sp += "M" + (15 - 2.3 * Math.cos(a)).toFixed(2) + "," + (10 - 2.3 * Math.sin(a)).toFixed(2) + "L" + (15 + 2.3 * Math.cos(a)).toFixed(2) + "," + (10 + 2.3 * Math.sin(a)).toFixed(2); }
      return stripes(["#FF9933", "#FFFFFF", "#138808"]) + '<g fill="none" stroke="#000080" stroke-width=".35"><circle cx="15" cy="10" r="2.6"/><path d="' + sp + '"/></g><circle cx="15" cy="10" r=".55" fill="#000080"/>';
    },
    US: function () {
      var st = "", s = "";
      for (var i = 0; i < 13; i++) if (i % 2 === 0) st += '<rect y="' + (i * 20 / 13).toFixed(3) + '" width="30" height="' + (20 / 13 + .02).toFixed(3) + '" fill="#B22234"/>';
      for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) s += '<circle cx="' + (1.1 + c * 2 + (r % 2) * 1).toFixed(2) + '" cy="' + (1.1 + r * 1.95).toFixed(2) + '" r=".42"/>';
      return '<rect width="30" height="20" fill="#FFFFFF"/>' + st + '<rect width="13" height="' + (20 * 7 / 13).toFixed(3) + '" fill="#3C3B6E"/><g fill="#FFFFFF">' + s + "</g>";
    },
    HK: function () {
      var p = "";
      for (var i = 0; i < 5; i++) p += '<path transform="rotate(' + (i * 72) + ' 15 10)" d="M15,10 C13.2,8.6 13.3,5.3 15.6,4.1 C16.9,5.4 17,7.8 15.4,9.2 Z"/>';
      return '<rect width="30" height="20" fill="#DE2910"/><g fill="#FFFFFF">' + p + "</g>";
    }
  };
  function flag(cc, w) {
    var f = FLAGS[cc];
    if (!f) return "";
    uid++;
    var vb = cc === "GB" ? "0 0 60 30" : "0 0 30 20";
    return '<svg class="flag" width="' + w + '" height="' + Math.round(w * 2 / 3) + '" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + f(uid) + "</svg>";
  }
  function ccChip(cc) { return '<span class="cc">' + flag(cc, 24) + "<span>" + cc + "</span></span>"; }

