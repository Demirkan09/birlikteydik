export type Package = "Temel Paket" | "Standart Paket" | "Premium Paket";

export interface UserPage {
  pageSlug: string;
  packageName: string;
  createdAt: string;
  remainingTime?: string;
  templateId?: string;
  isPublished?: boolean;
  activatedAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  pages: UserPage[];
}

export interface GeneratedCode {
  code: string;
  pageSlug: string;
  packageName: string;
  generatedAt: string;
}

export type ActiveTab = "create_page" | "codes" | "users" | "marketing" | "settings";
