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
    <div className="h-screen overflow-hidden">
        <NavBar />
        {children}
    </div>
  );
}
