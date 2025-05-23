import ProviderComponent from "@/components/layouts/provider-component";
import FloatingButton from "@/components/common/FloatingButton";
import "react-perfect-scrollbar/dist/css/styles.css";
import "../styles/tailwind.css";
import { Metadata } from "next";
import { Nunito } from "next/font/google";

export const metadata: Metadata = {
  title: {
    template: "CIE | SUIVI - ENCAISSEMENT",
    default: "SUIVI - ENCAISSEMENT",
  },
};
const nunito = Nunito({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={nunito.variable}>
        <ProviderComponent>
          {children}
          {/* <FloatingButton /> */}
        </ProviderComponent>
      </body>
    </html>
  );
}
