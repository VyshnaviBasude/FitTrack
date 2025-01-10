// app/profile/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="container">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p>You need to log in to access your profile.</p>
        <Button asChild>
          <a href="/api/auth/signin">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
      <Button asChild>
        <a href="/api/auth/signout">Log Out</a>
      </Button>
    </div>
  );
}
