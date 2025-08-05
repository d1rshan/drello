"use server";

import { auth } from "@/lib/auth";

interface signInProps {
  email: string;
  password: string;
}

const signIn = async ({ email, password }: signInProps) => {
  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
};

interface signUpProps {
  email: string;
  name: string;
  password: string;
  image?: string;
}

const signUp = async ({ email, name, password, image }: signUpProps) => {
  await auth.api.signUpEmail({
    body: {
      email,
      name,
      password,
      image,
    },
  });
};
