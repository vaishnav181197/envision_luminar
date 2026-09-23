const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(normalizeEmail(value));
}

export function extractEmailsFromText(text: string): string[] {
  const unique = new Set<string>();
  for (const raw of text.split(/[\s,;]+/)) {
    const email = normalizeEmail(raw.replace(/^"|"$/g, ""));
    if (isValidEmail(email)) {
      unique.add(email);
    }
  }
  return [...unique];
}

export function extractEmailsFromCsv(text: string): string[] {
  const unique = new Set<string>();
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);

  for (const line of lines) {
    const cells = line.split(/[,;\t]/);
    for (const cell of cells) {
      const email = normalizeEmail(cell.replace(/^"|"$/g, ""));
      if (isValidEmail(email)) {
        unique.add(email);
      }
    }
  }

  return [...unique];
}
