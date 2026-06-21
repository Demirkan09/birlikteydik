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
