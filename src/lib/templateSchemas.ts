export interface TemplateSchema {
  name: string;
  memoryFields: string[];
}

export const TEMPLATE_SCHEMAS: Record<string, TemplateSchema> = {
  // Database template IDs
  "klasik-retro": {
    name: "Koyu Gül Kurusu",
    memoryFields: ["title", "date", "caption", "rotate"],
  },
  "modern-minimal": {
    name: "Modern Minimal",
    memoryFields: ["title", "date", "description"],
  },
  "sinematik-ask": {
    name: "Sinematik Aşk",
    memoryFields: ["title", "date", "description"],
  },
  "premium-emerald": {
    name: "Zümrüt Yeşili",
    memoryFields: ["title", "date", "description"],
  },
  "romantik-kirmizi": {
    name: "Romantik Kırmızı",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-oyun": {
    name: "Oyuncu Şablonu",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-lavanta": {
    name: "Lavanta Rüyası",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-amber": {
    name: "Günbatımı Amberi",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-rose": {
    name: "Gül Kurusu",
    memoryFields: ["title", "date", "caption", "rotate"],
  },
  "sablon-indigo": {
    name: "Gece Yarısı İndigo",
    memoryFields: ["title", "date", "frame", "description"],
  },

  // Folder names (in case they are referenced directly)
  "sablon-retro": {
    name: "Koyu Gül Kurusu",
    memoryFields: ["title", "date", "caption", "rotate"],
  },
  "sablon-minimal": {
    name: "Modern Minimal",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-sinematik": {
    name: "Sinematik Aşk",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-emerald": {
    name: "Zümrüt Yeşili",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-kirmizi": {
    name: "Romantik Kırmızı",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-bos": {
    name: "Boş Şablon",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-lacivert": {
    name: "Lacivert",
    memoryFields: ["title", "date", "description"],
  },
  "sablon-mavi": {
    name: "Mavi",
    memoryFields: ["title", "date", "description"],
  },
};

export function formatCoupleNames(rawNames?: string | null): string {
  if (!rawNames) return "Sen\n&\nBen";
  const str = rawNames.trim();
  if (!str) return "Sen\n&\nBen";

  // If already multi-line, preserve or format to \n&\n
  if (str.includes("\n")) {
    if (str.includes("\n&\n")) return str;
    const parts = str.split("\n").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const name1 = parts[0];
      const name2 = parts[parts.length - 1];
      return `${name1}\n&\n${name2}`;
    }
    return str;
  }

  // Check for separators
  let name1 = "";
  let name2 = "";

  if (str.includes(" & ")) {
    [name1, name2] = str.split(" & ");
  } else if (str.includes("&")) {
    [name1, name2] = str.split("&");
  } else if (str.toLowerCase().includes(" ve ")) {
    const idx = str.toLowerCase().indexOf(" ve ");
    name1 = str.substring(0, idx);
    name2 = str.substring(idx + 4);
  } else if (str.includes(" - ")) {
    [name1, name2] = str.split(" - ");
  } else if (str.includes(" / ")) {
    [name1, name2] = str.split(" / ");
  } else if (str.includes(" + ")) {
    [name1, name2] = str.split(" + ");
  }

  if (name1 && name2 && name1.trim() && name2.trim()) {
    return `${name1.trim()}\n&\n${name2.trim()}`;
  }

  return str;
}
