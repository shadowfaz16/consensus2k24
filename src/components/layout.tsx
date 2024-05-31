import Head from "next/head";
import BottomBar from "./nav/bottom-bar";
import NavBar from "./navbar";


interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
}

export default function Layout({
  children,
}: LayoutProps) {
  return (
    <>
       <Head>
        <title>Amendment 0</title>
        <meta name="description" content="Transactional freedom in your hands" />
      </Head>
    <div className="min-h-screen">
        <NavBar />
        {children}
        <BottomBar />
    </div>
    </>
  );
}
