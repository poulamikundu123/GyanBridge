import { ReactNode } from "react";
import AppShellClient from "./AppShellClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

interface AppShellProps {
  children: ReactNode;
  allowedRole?: "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION";
}

export default async function AppShell({ children, allowedRole }: AppShellProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRole && user.role !== allowedRole) {
    // Graceful role redirection if attempting to view unauthorized portal
    if (user.role === "STUDENT") redirect("/student/dashboard");
    if (user.role === "INDUSTRY") redirect("/industry/dashboard");
    if (user.role === "FACULTY") redirect("/faculty/dashboard");
    if (user.role === "INSTITUTION") redirect("/institution/dashboard");
  }

  return (
    <AppShellClient user={user}>
      {children}
    </AppShellClient>
  );
}
