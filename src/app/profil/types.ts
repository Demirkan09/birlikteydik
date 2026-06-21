export type UserPage = {
  id: string;
  pageSlug: string;
  packageName: string;
  createdAt: string;
  remainingTime?: string;
};

export type User = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  marketingConsent?: boolean;
};
