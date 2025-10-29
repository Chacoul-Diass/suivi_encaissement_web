import ComponentsDashboardSales from "@/components/dashboard/components-dashboard-encaissement";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

const Analytics = () => {
  return <ComponentsDashboardSales />;
};

export default Analytics;
