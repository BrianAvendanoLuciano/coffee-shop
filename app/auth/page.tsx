"use client";

import SignIn from "@/components/auth/signIn";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const params = useSearchParams();
  const type = params.get("type");

  let content = <SignIn />;

  if (type === "signup") {
    content = <h1>Sign Up</h1>;
  }

  return <>{content}</>;
}
