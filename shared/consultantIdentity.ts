const TURKISH_ASCII_MAP: Record<string, string> = {
  Ç: "C",
  Ğ: "G",
  İ: "I",
  I: "I",
  Ö: "O",
  Ş: "S",
  Ü: "U",
};

function asciiInitial(value: string) {
  const upper = value.trim().toLocaleUpperCase("tr-TR");
  const first = upper[0] ?? "";
  return TURKISH_ASCII_MAP[first] ?? first.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function upperSurname(value: string) {
  return value
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/[ÇĞİIÖŞÜ]/g, character => TURKISH_ASCII_MAP[character] ?? character)
    .replace(/\s+/g, "");
}

export function normalizeConsultantLogin(firstName: string, lastName: string) {
  const initial = asciiInitial(firstName);
  const surname = upperSurname(lastName);
  if (!/^[A-Z]$/.test(initial) || !/^[A-ZÇĞİÖŞÜ]+$/.test(surname)) {
    throw new Error("Geçerli ad ve soyad zorunludur.");
  }
  return `${initial}-${surname}`;
}

export function consultantInitialPrefix(firstName: string, lastName: string) {
  const prefix = `${asciiInitial(firstName)}${asciiInitial(lastName)}`;
  if (!/^[A-Z]{2}$/.test(prefix)) throw new Error("Danışman kodu için ad ve soyad baş harfleri alınamadı.");
  return prefix;
}

export function nextConsultantCode(firstName: string, lastName: string, existingCodes: string[]) {
  const prefix = consultantInitialPrefix(firstName, lastName);
  const used = new Set(
    existingCodes
      .map(code => code.trim().toUpperCase().match(new RegExp(`^${prefix}(\\d+)$`)))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map(match => Number(match[1]))
      .filter(number => Number.isInteger(number) && number > 0),
  );
  let sequence = 1;
  while (used.has(sequence)) sequence += 1;
  return `${prefix}${sequence}`;
}
