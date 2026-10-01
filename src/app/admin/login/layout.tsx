// The login page should not inherit the admin layout (no sidebar).
// This layout overrides the parent admin/layout.tsx for the login route.
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
