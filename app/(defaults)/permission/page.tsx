import Permission from "@/components/permission/permission";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Modifier une permission",
};

const PermissionAdd = () => {
  return <Permission />;
};

export default PermissionAdd;
