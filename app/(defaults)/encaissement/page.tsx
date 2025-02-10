import ComponentsDashboardAnalytics from "@/components/dashboard/parent-encaissement";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Encaissement",
};

const Analytics = () => {
  return <ComponentsDashboardAnalytics />;
};

export default Analytics;
