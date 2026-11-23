const path = require("path");
const NM = path.join(__dirname, "node_modules");
const pptxgen = require(path.join(NM, "pptxgenjs"));
const QR = require(path.join(NM, "qrcode"));
const { applyTheme } = require("/root/.claude/skills/synced/9b33bb94-ea08-4c9e-8481-a062878f2a3c_b50c80d2-fa3f-467d-ad16-9ce5cb40f6d0/pptx/scripts/apply_theme.js");

const SP = path.join(__dirname, "..");
const IMG = (p) => path.join(SP, p);
const URL = "https://claude.ai/artifact/9PmUniU6Z4RYzZFxCLfD6x";
const OUT = process.argv[2] || path.join(__dirname, "Pythagoras_City_Einfuehrung.pptx");

const THEME = {
  name: "Pythagoras City",
  headFontFace: "Arial Black",
  bodyFontFace: "Arial",
  colors: {
    dk1: "141B3D", lt1: "FFFFFF", dk2: "232C5E", lt2: "F4F1FA",
    accent1: "E8338A", accent2: "FF8A2B", accent3: "FFC933",
    accent4: "2EC4B6", accent5: "6C63FF", accent6: "8A90B8",
    hlink: "E8338A", folHlink: "6C63FF",
  },
};

(async () => {
  const qr = await QR.toDataURL(URL, { errorCorrectionLevel: "M", margin: 2, width: 900, color: { dark: "#141B3DFF", light: "#FFFFFFFF" } });
  const QRDATA = qr.replace("data:", "");

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = "Pythagoras City – So funktioniert das Spiel";
  pres.subject = "Einführung für Schülerinnen und Schüler, Klasse 9";
  pres.author = "GHS Dohr";
  pres.company = "GHS Dohr";
  const C = pres.SchemeColor;
  const W = 13.333, H = 7.5;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "DUNKEL_TITEL",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.2, w: 7.4, h: 1.6, fontSize: 50, bold: true, color: C.background1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.95, w: 7.4, h: 1.1, fontSize: 22, color: C.accent3, valign: "top", align: "left", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "INHALT",
    background: { color: C.background2 },
    margin: [0.5, 0.6, 0.6, 0.6],
    objects: [
      { rect: { x: 0.6, y: 0.5, w: 0.16, h: 0.62, fill: { color: C.accent1 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.92, y: 0.42, w: 11.8, h: 0.78, fontSize: 30, bold: true, color: C.text1, valign: "middle", align: "left", margin: 0 }, text: "" } },
      { text: { text: "Pythagoras City · GHS Dohr", options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.55, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
  });
  pres.defineSlideMaster({
    title: "DUNKEL_INHALT",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.42, w: 12, h: 0.78, fontSize: 30, bold: true, color: C.background1, valign: "middle", align: "left", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.55, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
  });

  const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: THEME.bodyFontFace }, o));
  const circ = (s, x, y, d, col, label, fs, name) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: col }, line: { color: col }, objectName: name + " Kreis" });
    T(s, label, { x, y, w: d, h: d, align: "center", valign: "middle", fontSize: fs, bold: true, color: C.background1, objectName: name });
  };
  const card = (s, x, y, w, h, name, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.background1 }, line: { color: "E3DEEF", width: 0.75 },
    shadow: { type: "outer", color: "141B3D", opacity: 0.12, blur: 6, offset: 2, angle: 90 }, objectName: name,
  });
  const qrBlock = (s, x, y, d, dark) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.12, y: y - 0.12, w: d + 0.24, h: d + 0.24, rectRadius: 0.14, fill: { color: C.background1 }, line: { color: dark ? C.accent1 : "E3DEEF", width: dark ? 2.5 : 1 }, objectName: "QR-Rahmen" });
    s.addImage({ data: QRDATA, x, y, w: d, h: d, altText: "QR-Code zum Spiel Pythagoras City: " + URL, objectName: "QR-Code" });
  };

  // ---------- 1 Titel ----------
  pres.addSection({ title: "Start" });
  let s = pres.addSlide({ masterName: "DUNKEL_TITEL", sectionTitle: "Start" });
  s.addImage({ path: IMG("ppt/titel.png"), x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H }, transparency: 55, altText: "Titelbild des Spiels Pythagoras City", objectName: "Titelbild" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 8.7, h: H, fill: { color: C.text1, transparency: 0 }, line: { color: C.text1, transparency: 100 }, objectName: "Abdunklung" });
  T(s, "MATHE-ABENTEUER · KLASSE 9", { x: 0.7, y: 1.55, w: 7, h: 0.4, fontSize: 16, bold: true, color: C.accent2, charSpacing: 3 });
  s.addText("Pythagoras City", { placeholder: "title" });
  s.addText("Löse echte Aufgaben mit dem Satz des Pythagoras – mitten in Mönchengladbach.", { placeholder: "body" });
  T(s, "GHS Dohr · Standort Am Torfbend", { x: 0.7, y: 6.55, w: 7, h: 0.35, fontSize: 14, color: C.accent6 });
  qrBlock(s, 9.6, 2.0, 2.9, true);
  T(s, "Scannen und losspielen", { x: 9.2, y: 5.15, w: 3.7, h: 0.4, fontSize: 16, bold: true, color: C.background1, align: "center" });
  s.addNotes("Kurz das Spiel vorstellen: Ein 3D-Spiel auf der echten Karte von Mönchengladbach. Wer rechnet, kommt weiter. Der QR-Code führt direkt zum Spiel – es läuft im Browser, ohne Installation.");

  // ---------- 2 So startest du ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Start" });
  s.addText("So startest du", { placeholder: "title" });
  qrBlock(s, 0.95, 1.75, 4.0, false);
  T(s, [{ text: "Link zum Spiel", options: { bold: true, color: C.text1, breakLine: true } }, { text: URL, options: { color: C.accent1, hyperlink: { url: URL } } }],
    { x: 0.6, y: 6.0, w: 4.7, h: 0.7, fontSize: 12, align: "center" });
  const steps = [
    ["QR-Code scannen", "Kamera-App auf den Code richten und den Link antippen. Das Spiel läuft im Browser."],
    ["Neues Spiel anlegen", "Gib deinen Vornamen oder einen Spitznamen ein – keine vollständigen Namen."],
    ["Figur wählen", "Jede Figur hat eigene Aufgaben. Kinderfiguren bekommen leichtere, Herr Dittmann die schwersten."],
    ["Los geht's", "Folge dem gelben Pfeil zur ersten Mission und sprich die Person mit E oder Tippen an."],
  ];
  steps.forEach((st, i) => {
    const y = 1.6 + i * 1.3;
    card(s, 5.8, y, 6.95, 1.1, "Schritt " + (i + 1));
    circ(s, 6.05, y + 0.22, 0.66, [C.accent1, C.accent2, C.accent5, C.accent4][i], String(i + 1), 22, "Nummer " + (i + 1));
    T(s, st[0], { x: 6.95, y: y + 0.14, w: 5.6, h: 0.38, fontSize: 18, bold: true, color: C.text1 });
    T(s, st[1], { x: 6.95, y: y + 0.52, w: 5.6, h: 0.5, fontSize: 13, color: C.text2, valign: "top" });
  });
  s.addNotes("Gemeinsam starten: Alle scannen den Code. Wichtig: nur Vorname oder Spitzname eingeben. Der Spielstand wird auf dem jeweiligen Gerät im Browser gespeichert – also immer dasselbe Gerät und denselben Browser nutzen.");

  // ---------- 3 Worum geht's ----------
  pres.addSection({ title: "Das Spiel" });
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Das Spiel" });
  s.addText("Worum geht's?", { placeholder: "title" });
  s.addImage({ path: IMG("gfx/nachher_quer.png"), x: 7.05, y: 1.55, w: 5.7, h: 4.275, altText: "Spielszene: Straße in Rheydt mit Häusern und Figur", objectName: "Spielszene" });
  const why = [
    ["M", C.accent1, "Echte Stadt", "Du bewegst dich durch Mönchengladbach – vom Torfbend über Rheydt bis zum Flughafen."],
    ["a²", C.accent2, "Echte Aufgaben", "Leute in der Stadt brauchen Hilfe: Kabel, Leitern, Gräben, Diagonalen. Du misst und rechnest."],
    ["$", C.accent5, "Belohnung", "Für richtige Lösungen gibt es Geld und Erfahrungspunkte. Damit steigst du im Rang auf."],
  ];
  why.forEach((w, i) => {
    const y = 1.65 + i * 1.45;
    circ(s, 0.75, y, 0.8, w[1], w[0], w[0].length > 1 ? 20 : 26, w[2]);
    T(s, w[2], { x: 1.8, y: y - 0.02, w: 4.9, h: 0.4, fontSize: 19, bold: true, color: C.text1 });
    T(s, w[3], { x: 1.8, y: y + 0.4, w: 4.9, h: 0.75, fontSize: 14, color: C.text2, valign: "top" });
  });
  T(s, "Ziel: alle Hauptmissionen lösen und ganz Mönchengladbach freischalten.", { x: 0.75, y: 6.15, w: 12, h: 0.45, fontSize: 16, bold: true, italic: true, color: C.accent1 });
  s.addNotes("Das Spiel verbindet Mathe mit Alltagssituationen. Alle Aufgaben lassen sich mit dem Satz des Pythagoras lösen.");

  // ---------- 4 Steuerung ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Das Spiel" });
  s.addText("Steuerung", { placeholder: "title" });
  card(s, 0.6, 1.5, 4.5, 5.2, "Karte Tablet");
  T(s, "Tablet & Handy", { x: 0.9, y: 1.7, w: 4, h: 0.45, fontSize: 20, bold: true, color: C.accent1 });
  T(s, [
    { text: "Joystick links: gehen oder fahren", options: { bullet: true, breakLine: true } },
    { text: "Wischen: Kamera drehen", options: { bullet: true, breakLine: true } },
    { text: "Knopf rechts: Personen ansprechen, ein- und aussteigen", options: { bullet: true, breakLine: true } },
    { text: "Am besten im Querformat spielen", options: { bullet: true } },
  ], { x: 0.9, y: 2.3, w: 4, h: 3.2, fontSize: 15, color: C.text1, paraSpaceAfter: 10, valign: "top" });
  card(s, 5.4, 1.5, 7.35, 5.2, "Karte Tastatur");
  T(s, "Computer mit Tastatur", { x: 5.7, y: 1.7, w: 6.8, h: 0.45, fontSize: 20, bold: true, color: C.accent1 });
  const keys = [
    ["W A S D", "gehen, fahren, lenken"], ["Shift", "laufen / Nitro"], ["E", "ansprechen, Auftrag annehmen"],
    ["X", "aus dem Fahrzeug aussteigen"], ["Maus ziehen", "Kamera drehen"], ["M", "Karte"],
    ["J", "Auftragsheft"], ["H", "Theorie zum Nachlesen"], ["G", "Garage"], ["R / F", "Hubschrauber steigen / sinken"],
  ];
  const kRows = keys.map((k) => [
    { text: k[0], options: { bold: true, color: C.background1, fill: { color: C.text1 }, align: "center", fontFace: "Courier New" } },
    { text: k[1], options: { color: C.text1 } },
  ]);
  s.addTable(kRows.slice(0, 5), { x: 5.7, y: 2.3, w: 3.35, colW: [1.25, 2.1], fontSize: 12, rowH: 0.42, border: { type: "solid", pt: 3, color: "FFFFFF" }, fill: { color: "F4F1FA" }, valign: "middle" });
  s.addTable(kRows.slice(5), { x: 9.2, y: 2.3, w: 3.35, colW: [1.05, 2.3], fontSize: 12, rowH: 0.42, border: { type: "solid", pt: 3, color: "FFFFFF" }, fill: { color: "F4F1FA" }, valign: "middle" });
  T(s, "Tipp: Mit H öffnest du jederzeit die Theorie – dort steht alles noch einmal.", { x: 5.7, y: 5.75, w: 6.8, h: 0.6, fontSize: 13, italic: true, color: C.text2 });
  s.addNotes("Auf Tablets erscheinen die Bedienelemente automatisch. Die Taste H (bzw. der Hilfe-Knopf) zeigt die Theorie und die Steuerung im Spiel.");

  // ---------- 5 Satz des Pythagoras ----------
  pres.addSection({ title: "Mathe" });
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Mathe" });
  s.addText("Der Satz des Pythagoras", { placeholder: "title" });
  // Dreieck
  s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: 0.9, y: 2.0, w: 5.0, h: 3.6, fill: { color: "FBE3EF" }, line: { color: C.text1, width: 3 }, objectName: "Rechtwinkliges Dreieck" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: 5.25, w: 0.35, h: 0.35, fill: { color: "FBE3EF" }, line: { color: C.text1, width: 1.5 }, objectName: "Rechter Winkel" });
  T(s, "a", { x: 0.35, y: 3.5, w: 0.45, h: 0.5, fontSize: 28, bold: true, color: C.accent2, align: "center" });
  T(s, "b", { x: 3.15, y: 5.7, w: 0.5, h: 0.5, fontSize: 28, bold: true, color: C.accent2, align: "center" });
  T(s, "c", { x: 3.55, y: 3.15, w: 0.5, h: 0.5, fontSize: 28, bold: true, color: C.accent1, align: "center" });
  T(s, "Katheten a und b liegen am rechten Winkel. Die Hypotenuse c liegt ihm gegenüber und ist die längste Seite.", { x: 0.6, y: 6.25, w: 5.8, h: 0.6, fontSize: 12, color: C.text2 });
  card(s, 6.9, 1.55, 5.85, 1.7, "Formel");
  T(s, [{ text: "a", options: {} }, { text: "2", options: { superscript: true } }, { text: " + b", options: {} }, { text: "2", options: { superscript: true } }, { text: " = c", options: {} }, { text: "2", options: { superscript: true } }],
    { x: 6.9, y: 1.55, w: 5.85, h: 1.7, fontSize: 60, bold: true, color: C.accent1, align: "center", valign: "middle", fontFace: THEME.headFontFace });
  const rules = [
    ["Hypotenuse gesucht", "c = √(a² + b²)", "erst addieren, dann Wurzel"],
    ["Kathete gesucht", "a = √(c² − b²)", "erst subtrahieren, dann Wurzel"],
  ];
  rules.forEach((r, i) => {
    const y = 3.55 + i * 1.5;
    card(s, 6.9, y, 5.85, 1.3, r[0]);
    T(s, r[0], { x: 7.15, y: y + 0.15, w: 5.4, h: 0.35, fontSize: 15, bold: true, color: C.text2 });
    T(s, r[1], { x: 7.15, y: y + 0.5, w: 3.0, h: 0.6, fontSize: 24, bold: true, color: C.text1, fontFace: "Cambria" });
    T(s, r[2], { x: 10.1, y: y + 0.55, w: 2.5, h: 0.55, fontSize: 13, italic: true, color: C.accent2 });
  });
  s.addNotes("Wiederholung: Die Hypotenuse liegt immer gegenüber dem rechten Winkel. Typischer Fehler im Spiel: bei gesuchter Kathete addieren statt subtrahieren. Ergebnisse werden im Spiel meist auf eine Nachkommastelle gerundet eingegeben.");

  // ---------- 6 So löst du eine Mission ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Mathe" });
  s.addText("So löst du eine Mission", { placeholder: "title" });
  const flow = ["Auftrag annehmen", "Zum Messpunkt", "Maße ablesen", "Skizze nutzen", "Ergebnis eingeben"];
  const fw = 2.3, gap = 0.18;
  flow.forEach((f, i) => {
    const x = 0.6 + i * (fw + gap);
    s.addShape(i === 0 ? pres.shapes.PENTAGON : pres.shapes.CHEVRON, { x, y: 1.55, w: fw + 0.15, h: 0.85, fill: { color: [C.accent1, C.accent2, C.accent3, C.accent4, C.accent5][i] }, line: { color: C.background2, width: 0.5 }, objectName: "Schritt " + (i + 1) });
    T(s, (i + 1) + "  " + f, { x: x + (i ? 0.5 : 0.15), y: 1.55, w: fw - 0.42, h: 0.85, fontSize: 13, bold: true, color: i === 2 ? C.text1 : C.background1, valign: "middle" });
  });
  s.addImage({ path: IMG("ppt/sk_leiter.png"), x: 0.6, y: 2.75, w: 7.6, h: 7.6 * 590 / 1320, altText: "Aufgabe im Spiel: Leiter 10 m, Höhe 8 m, Abstand gesucht", objectName: "Aufgabenbeispiel" });
  card(s, 8.55, 2.75, 4.2, 3.4, "Beispielrechnung");
  T(s, "Beispiel: Leiter", { x: 8.8, y: 2.9, w: 3.8, h: 0.4, fontSize: 17, bold: true, color: C.accent1 });
  T(s, [
    { text: "Leiter c = 10 m, Höhe a = 8 m", options: { breakLine: true } },
    { text: "Gesucht: Abstand b (Kathete)", options: { breakLine: true } },
    { text: " ", options: { breakLine: true } },
    { text: "b = √(10² − 8²)", options: { bold: true, breakLine: true } },
    { text: "b = √(100 − 64) = √36", options: { bold: true, breakLine: true } },
    { text: "b = 6 m", options: { bold: true, color: C.accent1 } },
  ], { x: 8.8, y: 3.35, w: 3.8, h: 2.6, fontSize: 15, color: C.text1, fontFace: "Cambria", valign: "top" });
  T(s, "Bei falschen Antworten gibt es Tipps. Das Auftragsheft (J) merkt sich alle Maße.", { x: 0.6, y: 6.35, w: 12, h: 0.45, fontSize: 14, italic: true, color: C.text2 });
  s.addNotes("Ablauf zeigen: Bei vielen Missionen müssen die Maße erst vor Ort abgelesen werden (Markierungen in der Welt). Die Skizze im Aufgabenfenster zeigt, welche Seite gesucht ist (gestrichelt).");

  // ---------- 7 Hauptmissionen ----------
  pres.addSection({ title: "Missionen und Personen" });
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Missionen und Personen" });
  s.addText("Die Hauptmissionen", { placeholder: "title" });
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 } } });
  const ms = [
    ["Licht für den Werkhof", "Herr Ballhorn (Hausmeister)", "Dohr / Torfbend"],
    ["Ein Graben für die Wasserleitung", "Frau Lenzen", "Mülfort"],
    ["Ein Handlauf für die Außentreppe", "Frau Ziemer", "Schule Am Torfbend"],
    ["Quer über den Schulhof", "Herr Jessen", "Schule Am Torfbend"],
    ["Der Diagonal-Sprint", "Herr Maaß (in der Sporthalle)", "Schule Am Torfbend"],
    ["Quer über den Markt", "Frau Krahe", "Rheydt"],
  ];
  const mRows = [[hdr("#"), hdr("Mission"), hdr("Auftrag von"), hdr("Wo?")]].concat(ms.map((m, i) => [
    { text: String(i + 1), options: { bold: true, color: C.accent1, align: "center" } },
    { text: m[0], options: { bold: true, color: C.text1 } }, { text: m[1], options: { color: C.text2 } }, { text: m[2], options: { color: C.text2 } }]));
  s.addTable(mRows, { x: 0.6, y: 1.55, w: 7.5, colW: [0.5, 3.0, 2.3, 1.7], fontSize: 13, rowH: 0.56, border: { type: "solid", pt: 1, color: "E3DEEF" }, fill: { color: C.background1 }, valign: "middle", margin: [0.04, 0.1, 0.04, 0.1] });
  s.addImage({ path: IMG("H_wide.png"), x: 8.45, y: 1.55, w: 4.3, h: 4.3 * 640 / 1000, altText: "Die Sporthalle im Spiel", objectName: "Sporthalle" });
  T(s, "In der Sporthalle wartet Herr Maaß mit dem Diagonal-Sprint.", { x: 8.45, y: 4.4, w: 4.3, h: 0.6, fontSize: 12, italic: true, color: C.text2 });
  T(s, "Neben den Hauptmissionen gibt es viele Nebenaufgaben, Jobs und Suchspiele in der ganzen Stadt.", { x: 0.6, y: 5.75, w: 7.5, h: 0.7, fontSize: 14, color: C.text1 });
  s.addNotes("Die Reihenfolge gibt das Spiel vor: Ein gelber Pfeil zeigt immer zur nächsten Hauptmission. Die Aufträge kommen von Lehrkräften und Personen aus dem Stadtteil.");

  // ---------- 8 Lehrkräfte ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Missionen und Personen" });
  s.addText("Wen du im Spiel triffst", { placeholder: "title" });
  const ppl = [
    ["Herr Dittmann", "Klassenlehrer der 9c", "Als Spielfigur wählbar – mit den schwersten Aufgaben.", C.accent1],
    ["Herr Meindorfner", "Mathelehrer", "Gibt Mathe-Training mit Pythagoras-Aufgaben.", C.accent2],
    ["Frau Costantino", "Englischlehrerin", "Stellt ihre Aufgaben auf Englisch.", C.accent5],
    ["Herr Maaß", "Sportlehrer", "Wartet in der Sporthalle mit einer sportlichen Aufgabe.", C.accent4],
    ["Herr Jessen", "Deutschlehrer", "Mission „Quer über den Schulhof“.", C.accent2],
    ["Frau Krahe", "Klassenlehrerin der 10b", "Mission „Quer über den Markt“ in Rheydt.", C.accent5],
    ["Frau Ziemer", "Klassenlehrerin der 9a", "Mission „Ein Handlauf für die Außentreppe“.", C.accent4],
    ["Aktas · Colonna · Brand", "MPT-Kräfte", "Geben Tipps und kleine Aufgaben zum Üben.", C.accent1],
  ];
  ppl.forEach((p, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.6 + col * 3.07, y = 1.55 + row * 2.6, w = 2.85, h = 2.35;
    card(s, x, y, w, h, p[0]);
    const ini = p[0].replace(/^(Herr|Frau) /, "").split(/[ ·]+/).filter(Boolean).map((q) => q[0]).join("").slice(0, 3);
    circ(s, x + 0.22, y + 0.22, 0.7, p[3], ini, ini.length > 1 ? 15 : 20, "Initiale " + p[0]);
    T(s, p[0], { x: x + 1.05, y: y + 0.22, w: w - 1.15, h: 0.7, fontSize: 14, bold: true, color: C.text1, valign: "middle" });
    T(s, p[1], { x: x + 0.22, y: y + 1.05, w: w - 0.4, h: 0.35, fontSize: 12, bold: true, color: p[3] === C.accent3 ? C.text2 : p[3] });
    T(s, p[2], { x: x + 0.22, y: y + 1.4, w: w - 0.4, h: 0.85, fontSize: 12, color: C.text2, valign: "top" });
  });
  s.addNotes("Die Lehrkräfte der Schule tauchen im Spiel mit ihren echten Rollen auf. Frau Costantino spricht Englisch – die Aufgaben sind dann englisch formuliert.");

  // ---------- 9 Fahrzeuge & Verkehr ----------
  pres.addSection({ title: "Stadt und Fortschritt" });
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Stadt und Fortschritt" });
  s.addText("Fahrzeuge, Läden und Verkehrsregeln", { placeholder: "title" });
  s.addImage({ path: IMG("S_rad_weit.png"), x: 0.6, y: 1.55, w: 5.4, h: 5.4 * 640 / 1000, altText: "Fahrradladen im Spiel mit Rädern und E-Scootern", objectName: "Fahrradladen" });
  T(s, "Der Fahrradladen an der Hauptstraße in Rheydt", { x: 0.6, y: 5.07, w: 5.4, h: 0.35, fontSize: 12, italic: true, color: C.text2 });
  const shops = [
    ["Fahrradladen", "Hauptstraße, Rheydt", "Fahrräder und E-Scooter kaufen"],
    ["Autohaus", "Gracht", "Autos kaufen – nur mit Erwachsenen-Figur"],
    ["Flughafen", "Mönchengladbach", "Hubschrauber und Flugzeuge mieten (ab Phase 4)"],
  ];
  shops.forEach((sh, i) => {
    const y = 1.55 + i * 0.95;
    card(s, 6.35, y, 6.4, 0.8, sh[0]);
    T(s, sh[0], { x: 6.6, y: y + 0.08, w: 1.9, h: 0.64, fontSize: 15, bold: true, color: C.accent1, valign: "middle" });
    T(s, [{ text: sh[2], options: { bold: true, color: C.text1, breakLine: true } }, { text: sh[1], options: { color: C.text2 } }], { x: 8.5, y: y + 0.08, w: 4.1, h: 0.64, fontSize: 12, valign: "middle" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.35, y: 4.5, w: 6.4, h: 2.1, rectRadius: 0.12, fill: { color: "FFF4D6" }, line: { color: C.accent3, width: 1.5 }, objectName: "Regeln" });
  T(s, "Regeln im Spiel – wie im echten Leben", { x: 6.6, y: 4.6, w: 6, h: 0.4, fontSize: 15, bold: true, color: C.text1 });
  T(s, [
    { text: "Kinderfiguren dürfen nur Fahrrad und E-Scooter kaufen und fahren.", options: { bullet: true, breakLine: true } },
    { text: "Auf dem Schulgelände wird nicht gefahren.", options: { bullet: true, breakLine: true } },
    { text: "Mit dem E-Scooter auf die Straße, nicht auf den Gehweg.", options: { bullet: true, breakLine: true } },
    { text: "Rote Ampeln beachten – sonst gibt es Ärger.", options: { bullet: true } },
  ], { x: 6.6, y: 5.0, w: 6, h: 1.5, fontSize: 13, color: C.text1, paraSpaceAfter: 3, valign: "top" });
  s.addNotes("Geld aus Missionen kann in Fahrzeuge investiert werden. Die Verkehrsregeln sind bewusst eingebaut (Verkehrserziehung). Gekaufte Fahrzeuge findet man in der Garage (Taste G).");

  // ---------- 10 Phasen ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Stadt und Fortschritt" });
  s.addText("Ganz Mönchengladbach freischalten", { placeholder: "title" });
  T(s, "Am Anfang ist nur das Schulumfeld offen. Mit jeder geschafften Stufe wird die Karte größer.", { x: 0.6, y: 1.4, w: 12, h: 0.45, fontSize: 15, color: C.text2 });
  const ph = [
    ["1", "Rheydt und Schulumfeld", "von Anfang an offen"],
    ["2", "Rheydter Süden", "3 Hauptmissionen geschafft"],
    ["3", "Gladbach und Innenstadt", "alle Hauptmissionen geschafft"],
    ["4", "Nord und Ost", "Rang 3 „Hypotenusen-Held“ – mit dem Flughafen"],
    ["5", "West", "Rang 4 „Wurzel-Profi“"],
  ];
  const pc = [C.accent4, C.accent5, C.accent2, C.accent1, C.text1];
  ph.forEach((p, i) => {
    const x = 0.6 + i * 2.47, w = 2.3;
    const hh = 1.6 + i * 0.55, y = 6.55 - hh;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: hh, rectRadius: 0.1, fill: { color: pc[i] }, line: { color: pc[i] }, objectName: "Phase " + p[0] });
    T(s, "Phase " + p[0], { x: x + 0.18, y: y + 0.15, w: w - 0.3, h: 0.35, fontSize: 13, bold: true, color: C.background1 });
    T(s, p[1], { x: x + 0.18, y: y + 0.5, w: w - 0.3, h: 0.7, fontSize: 15, bold: true, color: C.background1, valign: "top" });
    T(s, p[2], { x: x + 0.18, y: y + hh - 0.75, w: w - 0.3, h: 0.62, fontSize: 11, color: C.background1, valign: "bottom" });
  });
  s.addNotes("Gesperrte Gebiete sind auf der Karte (M) abgedunkelt. Was einmal freigeschaltet ist, bleibt freigeschaltet. Der Flughafen liegt in Phase 4.");

  // ---------- 11 Ränge ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Stadt und Fortschritt" });
  s.addText("Ränge und Figuren", { placeholder: "title" });
  const ranks = [["0", "Rechen-Rookie"], ["100", "Kathetenkurier"], ["250", "Hypotenusen-Held"], ["450", "Wurzel-Profi"], ["700", "Pythagoras-Legende"]];
  ranks.forEach((r, i) => {
    const y = 5.75 - i * 1.0;
    const w = 4.0 + i * 0.65;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w, h: 0.78, rectRadius: 0.1, fill: { color: [C.accent4, C.accent5, C.accent2, C.accent1, C.text1][i] }, line: { color: C.background2 }, objectName: "Rang " + (i + 1) });
    T(s, "Rang " + (i + 1) + "  " + r[1], { x: 0.8, y, w: w - 1.4, h: 0.78, fontSize: 15, bold: true, color: C.background1, valign: "middle" });
    T(s, r[0] + " XP", { x: 0.6 + w - 1.3, y, w: 1.15, h: 0.78, fontSize: 13, color: C.background1, align: "right", valign: "middle" });
  });
  card(s, 7.55, 1.55, 5.2, 4.98, "Figuren");
  T(s, "Deine Figur bestimmt die Aufgaben", { x: 7.8, y: 1.75, w: 4.8, h: 0.45, fontSize: 17, bold: true, color: C.accent1 });
  T(s, [
    { text: "Kinderfiguren (z. B. Noah): leichtere Aufgaben, nur Fahrrad und E-Scooter.", options: { bullet: true, breakLine: true } },
    { text: "Erwachsene Figuren: Aufgaben passend zum Beruf – der Bauarbeiter vermisst z. B. eine Mauer auf der Baustelle.", options: { bullet: true, breakLine: true } },
    { text: "Herr Dittmann: die schwersten Aufgaben im ganzen Spiel.", options: { bullet: true, breakLine: true } },
    { text: "Mit höherem Rang werden neue Fahrzeuge, Gebiete und Flüge freigeschaltet.", options: { bullet: true } },
  ], { x: 7.8, y: 2.3, w: 4.8, h: 4.0, fontSize: 14, color: C.text1, paraSpaceAfter: 10, valign: "top" });
  s.addNotes("XP gibt es für jede gelöste Aufgabe. Differenzierung: Wer sich mehr zutraut, wählt eine erwachsene Figur oder Herrn Dittmann.");

  // ---------- 12 Tipps ----------
  s = pres.addSlide({ masterName: "INHALT", sectionTitle: "Stadt und Fortschritt" });
  s.addText("Tipps für dich", { placeholder: "title" });
  const tips = [
    ["1", "Heft und Taschenrechner bereitlegen", "Schreib die Rechnung mit – so findest du Fehler schneller."],
    ["2", "Immer dasselbe Gerät nutzen", "Der Spielstand wird im Browser gespeichert. Anderes Gerät = neuer Spielstand."],
    ["3", "Ruckelt das Spiel?", "Im Menü auf „Grafik“ tippen, bis „Schul-iPad“ dasteht."],
    ["4", "Erst denken, dann tippen", "Welche Seite ist gesucht? Hypotenuse oder Kathete?"],
    ["5", "Theorie nutzen", "Taste H oder der Hilfe-Knopf erklärt den Satz des Pythagoras."],
    ["6", "Fair bleiben", "Hilf anderen beim Verstehen, aber verrate nicht nur das Ergebnis."],
  ];
  tips.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.55 + row * 1.7, w = 6.0, h = 1.5;
    card(s, x, y, w, h, "Tipp " + t[0]);
    circ(s, x + 0.25, y + 0.38, 0.72, [C.accent1, C.accent2, C.accent5, C.accent4, C.accent2, C.accent1][i], t[0], 20, "Tipp-Nummer " + t[0]);
    T(s, t[1], { x: x + 1.2, y: y + 0.2, w: w - 1.4, h: 0.42, fontSize: 16, bold: true, color: C.text1 });
    T(s, t[2], { x: x + 1.2, y: y + 0.65, w: w - 1.4, h: 0.7, fontSize: 13, color: C.text2, valign: "top" });
  });
  s.addNotes("Hinweis zum Speichern betonen: Spielstände liegen nur lokal im Browser. Privates Surfen / Inkognito löscht den Stand beim Schließen.");

  // ---------- 13 Ende ----------
  pres.addSection({ title: "Los geht's" });
  s = pres.addSlide({ masterName: "DUNKEL_TITEL", sectionTitle: "Los geht's" });
  s.addText("Viel Spaß beim Rechnen!", { placeholder: "title" });
  s.addText("Scanne den Code und starte deine erste Mission.", { placeholder: "body" });
  T(s, URL, { x: 0.7, y: 5.3, w: 7.4, h: 0.4, fontSize: 14, color: C.accent6, hyperlink: { url: URL } });
  qrBlock(s, 9.3, 1.7, 3.4, true);
  T(s, "Pythagoras City", { x: 9.0, y: 5.4, w: 4.0, h: 0.4, fontSize: 16, bold: true, color: C.background1, align: "center" });
  s.addNotes("Diese Folie während der Spielphase stehen lassen, damit alle den Code scannen können.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("ok", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
