import { AppProviders } from "@/components/providers/app-providers";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main
            data-capture-root
            className="flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
          >
            <div className="mx-auto w-full max-w-[1200px]">{children}</div>
          </main>
        </div>
      </div>
    </AppProviders>
  );
}
