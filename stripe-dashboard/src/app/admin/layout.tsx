import { AppProviders } from "@/components/providers/app-providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-canvas">{children}</div>
    </AppProviders>
  );
}
