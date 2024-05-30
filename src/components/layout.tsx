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
    <div className="min-h-screen">
        <NavBar />
        {children}
    </div>
  );
}
