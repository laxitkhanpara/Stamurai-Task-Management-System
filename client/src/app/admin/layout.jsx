import AdminLayout from '../components/layout/AdminLayout';

export default function AdminLayoutWrapper({ children }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}