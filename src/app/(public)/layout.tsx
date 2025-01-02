import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { ReactNode } from "react";

interface IProps {
  children: ReactNode
}

export default async function Layout({ children }: IProps) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
