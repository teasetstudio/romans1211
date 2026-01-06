import Footer from "@/components/widgets/ui/Footer";
import Header from "@/components/widgets/ui/Header";
import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
};

export default async function Layout({ children }: IProps) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
