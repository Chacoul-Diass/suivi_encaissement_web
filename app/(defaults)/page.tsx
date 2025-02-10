"use client";

import { Metadata } from "next";
import React from "react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "CONNEXION",
};

export default function Home() {
  redirect("/auth/login");

  return null;
}
