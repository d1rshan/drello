import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function HomePage() {
  // extra check other than middleware as it only checks for session cookie locally
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });
  // if (!session) {
  //   return redirect("/sign-in");
  // }
  return (
    <div>
      Hello <SignOutButton />
    </div>
  );
}
