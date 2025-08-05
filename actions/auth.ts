"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface signInProps {
  email: string;
  password: string;
}

export const signIn = async ({ email, password }: signInProps) => {
  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  redirect("/");
};

interface signUpProps {
  email: string;
  name: string;
  password: string;
  image?: string;
}

export const signUp = async ({ email, name, password, image }: signUpProps) => {
  await auth.api.signUpEmail({
    body: {
      email,
      name,
      password,
      image,
    },
  });
  console.log("SUCCESS");
  redirect("/");
};
