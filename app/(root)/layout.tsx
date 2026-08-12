import RightWidgets from "@/components/layout/RightWidgets";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <a
        href="#main"
        className="skip-link sr-only focus:not-sr-only fixed left-4 top-4 z-50 rounded-md bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] px-3 py-2 text-sm font-medium"
      >
        Skip to content
      </a>

      <Sidebar />

      <main
        id="main"
        className="flex-1 min-w-0 px-4 py-8 pt-20 lg:ml-48 xl:mr-80 lg:px-8 lg:pt-8"
      >
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>

      <RightWidgets />
    </div>
  );
}
