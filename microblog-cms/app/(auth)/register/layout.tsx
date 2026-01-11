import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new Microblog CMS account to start publishing your thoughts and ideas",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
