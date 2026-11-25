/*
 * الصور الرمزية الجاهزة: ١٢ شخصية كرتونية SVG تُرسم محليًا في المتصفح.
 * بلا خادم ولا تخزين — كل صورة تتحول إلى رابط data: عند الطلب.
 */
window.Avatars = (function () {
  var EYE = "#2e2118", LIP = "#a4553e";

  function eyes(x, y, style) {
    if (style === "happy")
      return '<path d="M' + (x - 8) + ',' + (y + 1) + ' Q' + (x - 4.5) + ',' + (y - 4) + ' ' + (x - 1) + ',' + (y + 1) + '" fill="none" stroke="' + EYE + '" stroke-width="2" stroke-linecap="round"/>' +
             '<path d="M' + (x + 8) + ',' + (y + 1) + ' Q' + (x + 11.5) + ',' + (y - 4) + ' ' + (x + 15) + ',' + (y + 1) + '" fill="none" stroke="' + EYE + '" stroke-width="2" stroke-linecap="round"/>';
    return '<circle cx="' + (x - 5) + '" cy="' + y + '" r="2.3" fill="' + EYE + '"/>' +
           '<circle cx="' + (x + 9) + '" cy="' + y + '" r="2.3" fill="' + EYE + '"/>';
  }
  function brows(x, y, c) {
    return '<path d="M' + (x - 8) + ',' + y + ' L' + (x - 2) + ',' + (y - 1) + '" stroke="' + c + '" stroke-width="1.6" stroke-linecap="round"/>' +
           '<path d="M' + (x + 6) + ',' + (y - 1) + ' L' + (x + 12) + ',' + y + '" stroke="' + c + '" stroke-width="1.6" stroke-linecap="round"/>';
  }
  function smile(x, y, big) {
    return big
      ? '<path d="M' + (x - 4) + ',' + y + ' Q' + (x + 2) + ',' + (y + 6) + ' ' + (x + 8) + ',' + y + ' Q' + (x + 2) + ',' + (y + 10) + ' ' + (x - 4) + ',' + y + ' Z" fill="#7c3f2e"/>'
      : '<path d="M' + (x - 4) + ',' + y + ' Q' + (x + 2) + ',' + (y + 5) + ' ' + (x + 8) + ',' + y + '" fill="none" stroke="' + LIP + '" stroke-width="2" stroke-linecap="round"/>';
  }
  function blush(x, y) {
    return '<circle cx="' + (x - 10) + '" cy="' + y + '" r="3" fill="#f2a0a0" opacity=".55"/>' +
           '<circle cx="' + (x + 14) + '" cy="' + y + '" r="3" fill="#f2a0a0" opacity=".55"/>';
  }
  function glasses(x, y) {
    return '<g fill="none" stroke="#37474f" stroke-width="1.8">' +
      '<circle cx="' + (x - 5) + '" cy="' + y + '" r="5.2"/><circle cx="' + (x + 9) + '" cy="' + y + '" r="5.2"/>' +
      '<path d="M' + (x + 0.2) + ',' + (y - 1) + ' L' + (x + 3.8) + ',' + (y - 1) + '"/>' +
      '<path d="M' + (x - 10.2) + ',' + (y - 2) + ' L' + (x - 15) + ',' + (y - 4) + '"/>' +
      '<path d="M' + (x + 14.2) + ',' + (y - 2) + ' L' + (x + 19) + ',' + (y - 4) + '"/></g>';
  }
  function beard(x, c) {
    /* لحية حول الذقن مع فتحة للفم */
    return '<path d="M' + (x - 14) + ',46 Q' + (x - 14) + ',64 ' + (x + 2) + ',64 Q' + (x + 18) + ',64 ' + (x + 18) + ',46 Q' + (x + 16) + ',55 ' + (x + 2) + ',56 Q' + (x - 12) + ',55 ' + (x - 14) + ',46 Z" fill="' + c + '"/>' +
      '<path d="M' + (x - 3) + ',50.5 Q' + (x + 2) + ',53 ' + (x + 7) + ',50.5 Q' + (x + 5) + ',55 ' + (x + 2) + ',54.6 Q' + (x - 1) + ',55 ' + (x - 3) + ',50.5 Z" fill="' + c + '"/>';
  }

  function head(o) {
    /* o: {skin, hairC, hair: short|curly|cap|hijab|none, capC, hijabC, hijabD} */
    var s = "";
    if (o.hair === "hijab") {
      s += '<path d="M48,13 C29,13 22,30 22.5,46 C23,61 31,71 48,71 C65,71 73,61 73.5,46 C74,30 67,13 48,13 Z" fill="' + o.hijabC + '"/>';
      s += '<ellipse cx="48" cy="48" rx="13.5" ry="14" fill="' + o.skin + '"/>';
      s += '<path d="M34.5,41 Q48,28 61.5,41 L61.5,35 Q48,23 34.5,35 Z" fill="' + o.hijabC + '"/>';
      return s;
    }
    s += '<circle cx="48" cy="44" r="19" fill="' + o.skin + '"/>';
    if (o.hair === "short")
      s += '<path d="M29,46 Q26,20 48,20 Q70,20 67,46 Q65,29 48,27.5 Q31,29 29,46 Z" fill="' + o.hairC + '"/>';
    else if (o.hair === "curly")
      s += '<circle cx="35" cy="29" r="8" fill="' + o.hairC + '"/><circle cx="48" cy="24" r="9" fill="' + o.hairC + '"/><circle cx="61" cy="29" r="8" fill="' + o.hairC + '"/><path d="M31,36 Q48,26 65,36 L65,32 Q48,22 31,32 Z" fill="' + o.hairC + '"/>';
    else if (o.hair === "cap")
      s += '<path d="M28,40 Q28,19 48,19 Q68,19 68,40 Z" fill="' + o.capC + '"/>' +
           '<rect x="26" y="36" width="44" height="6" rx="3" fill="' + o.capC + '"/>' +
           '<circle cx="48" cy="18" r="2.6" fill="' + o.capC + '"/>';
    else if (o.hair === "band")
      s += '<path d="M29,46 Q26,20 48,20 Q70,20 67,46 Q65,29 48,27.5 Q31,29 29,46 Z" fill="' + o.hairC + '"/>' +
           '<path d="M31,33 Q48,25 65,33" fill="none" stroke="' + o.bandC + '" stroke-width="5" stroke-linecap="round"/>';
    else if (o.hair === "pigtails")
      s += '<path d="M29,46 Q26,20 48,20 Q70,20 67,46 Q65,29 48,27.5 Q31,29 29,46 Z" fill="' + o.hairC + '"/>' +
           '<circle cx="27" cy="46" r="7.5" fill="' + o.hairC + '"/><circle cx="69" cy="46" r="7.5" fill="' + o.hairC + '"/>' +
           '<circle cx="27" cy="40" r="2.2" fill="' + o.bandC + '"/><circle cx="69" cy="40" r="2.2" fill="' + o.bandC + '"/>';
    return s;
  }

  function build(o) {
    var isHijab = o.hair === "hijab";
    var fy = isHijab ? 48 : 45; /* مستوى العينين */
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">';
    s += '<circle cx="48" cy="48" r="48" fill="' + o.bg + '"/>';
    /* الأكتاف */
    s += '<path d="M16,96 C16,73 32,65 48,65 C64,65 80,73 80,96 Z" fill="' + (isHijab ? o.hijabD : o.shirt) + '"/>';
    if (isHijab) s += '<path d="M22,84 Q48,66 74,84 L74,96 L22,96 Z" fill="' + o.hijabD + '" opacity=".7"/>';
    s += head(o);
    var fx = isHijab ? 46 : 46; /* مركز ملامح الوجه */
    s += brows(fx, fy - 7, isHijab ? "#4a3b2c" : o.hairC || "#4a3b2c");
    s += eyes(fx, fy, o.eyes || "dot");
    if (o.blush) s += blush(fx, fy + 6);
    if (o.beard) s += beard(fx, o.hairC);
    s += smile(fx, isHijab ? fy + 9 : fy + 8, o.bigSmile);
    if (o.glasses) s += glasses(fx, fy);
    if (o.flower) {
      s += '<g transform="translate(66,30)"><circle r="2.6" fill="#e8b4c8"/><circle cx="0" cy="-4.4" r="2.4" fill="#f7d0dd"/><circle cx="4.2" cy="-1.4" r="2.4" fill="#f7d0dd"/><circle cx="2.6" cy="3.6" r="2.4" fill="#f7d0dd"/><circle cx="-2.6" cy="3.6" r="2.4" fill="#f7d0dd"/><circle cx="-4.2" cy="-1.4" r="2.4" fill="#f7d0dd"/></g>';
    }
    s += "</svg>";
    return s;
  }

  var SKINS = ["#f2c9a4", "#e8b48c", "#d99e70", "#c98a5c"];
  var PRESETS = [
    { id: "a1",  o: { bg: "#f6d68a", shirt: "#b3543f", skin: SKINS[0], hairC: "#3a2a1c", hair: "cap",  capC: "#8a5a2e", eyes: "dot", bigSmile: true } },
    { id: "a2",  o: { bg: "#f3c1cf", shirt: "#7a4a5a", skin: SKINS[1], hair: "hijab", hijabC: "#c96f8f", hijabD: "#a85373", eyes: "happy", blush: true } },
    { id: "a3",  o: { bg: "#a8d5c9", shirt: "#2e5f52", skin: SKINS[2], hairC: "#241a12", hair: "short", beard: true } },
    { id: "a4",  o: { bg: "#bcd7f0", shirt: "#3f6d9e", skin: SKINS[0], hairC: "#5a3b22", hair: "band", bandC: "#d4af5f", eyes: "happy", blush: true, bigSmile: true } },
    { id: "a5",  o: { bg: "#cfe3a8", shirt: "#567a3a", skin: SKINS[1], hairC: "#2e2118", hair: "short", glasses: true } },
    { id: "a6",  o: { bg: "#d9c6ef", shirt: "#5f4a7a", skin: SKINS[3], hair: "hijab", hijabC: "#8d6fb8", hijabD: "#6f549a", eyes: "dot", blush: true } },
    { id: "a7",  o: { bg: "#f2c9a0", shirt: "#8a4a2e", skin: SKINS[2], hairC: "#4a4a4a", hair: "short", beard: true, glasses: true } },
    { id: "a8",  o: { bg: "#f7cfd9", shirt: "#a8506a", skin: SKINS[0], hairC: "#241a12", hair: "pigtails", bandC: "#d4af5f", eyes: "happy", blush: true, flower: true } },
    { id: "a9",  o: { bg: "#a9c8ec", shirt: "#2e4a6e", skin: SKINS[1], hairC: "#1e150f", hair: "curly", bigSmile: true } },
    { id: "a10", o: { bg: "#c2e4d4", shirt: "#3a6a54", skin: SKINS[3], hair: "hijab", hijabC: "#5f9e84", hijabD: "#47826a", eyes: "happy", glasses: true } },
    { id: "a11", o: { bg: "#d8cdbd", shirt: "#5a4a36", skin: SKINS[2], hairC: "#2e2118", hair: "cap", capC: "#4a5a6a", beard: true } },
    { id: "a12", o: { bg: "#f5dfa8", shirt: "#9e7a3a", skin: SKINS[0], hairC: "#6a4526", hair: "band", bandC: "#c96f8f", eyes: "dot", blush: true } }
  ];

  var byId = {};
  PRESETS.forEach(function (p) { byId[p.id] = p; });

  function svgOf(id) {
    var p = byId[id] || PRESETS[0];
    return build(p.o);
  }
  function url(id) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgOf(id));
  }
  return { PRESETS: PRESETS, svgOf: svgOf, url: url };
})();
