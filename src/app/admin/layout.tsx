import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col md:flex-row">
      <AdminSidebar />
      {/* Main content area — top padding on mobile for fixed header bar */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 overflow-x-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
