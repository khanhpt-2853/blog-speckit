import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Microblog CMS account to create and manage your posts",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
