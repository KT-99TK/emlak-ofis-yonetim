import fs from "node:fs";

const sources = [
  "/home/ubuntu/upload/pasted_content_2.txt",
  "/home/ubuntu/upload/pasted_content_3.txt",
];
const source = sources.map(file => fs.readFileSync(file, "utf8")).join("\n");
const heading = /^(\d+)(?:\.|-(?!\d))\s*(.+)$/;
const rows = source.split(/\r?\n/).map(line => line.replace(/^\d+\s+/, "").trim());
const clauses = [];
let current = null;
for (const line of rows) {
  const match = line.match(heading);
  if (match) {
    if (current) clauses.push(current);
    current = { number: Number(match[1]), title: match[2].trim(), lines: [] };
  } else if (current && line) {
    current.lines.push(line);
  }
}
if (current) clauses.push(current);
const selected = clauses.filter(clause => clause.number >= 1 && clause.number <= 21 && !/AKDİ YAPAN TARAFLAR/i.test(clause.title));
if (selected.length !== 21) { console.error(selected.map(clause => `${clause.number}:${clause.title}`).join("\n")); throw new Error(`21 madde bekleniyordu, ${selected.length} bulundu.`); }

const replacements = [
  [/Yaşar Yılmaz|Erdinç Yılmaz|İbrahim Parin|Cihan Sabancı|Sabancı Yapı ve Malzemeleri San\. ve Tic\./gi, "ilgili taraf"],
  [/Güvendik Mahallesi 223\. Sokak No: 5\/3A Urla\/İzmir|Hacı İsa Mahallesi 75\. Yıl Cumhuriyet Caddesi No: 5\/38 Urla\/İzmir|Altıntaş Mahallesi Ahmet Besim Uyal Cad\. No:8\/1 Urla\/İzmir/gi, "[doldurulabilir adres]"],
  [/\b\d{11}\b/g, "[doldurulabilir kimlik/vergi no]"],
  [/\b\d{5,6}\b/g, "[doldurulabilir yevmiye/no]"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[doldurulabilir e-posta]"],
];
const sanitize = value => replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
const output = `/* Generated from the user-provided agreed source text. Personal values are sanitized into placeholders. */\nexport const LAND_SHARE_FIXED_CLAUSES = [\n${selected.map(clause => {
  const body = sanitize(clause.lines.join(" ")).replace(/`/g, "\\`").replace(/\\/g, "\\\\");
  const title = sanitize(clause.title).replace(/`/g, "\\`").replace(/\\/g, "\\\\");
  return `  { partyScope: "shared" as const, title: \`${title}\`, bodyTemplate: \`${body}\`, sortOrder: ${1000 + clause.number}, status: "active" as const, sourceNote: "Kullanıcının sağladığı mutabık Kat Karşılığı sözleşme metni" },`;
}).join("\n")}\n] as const;\n`;
fs.writeFileSync("/home/ubuntu/emlak-ofis-yonetim/shared/landShareFixedClauses.ts", output);
console.log(`Sanitized ${selected.length} clauses.`);
