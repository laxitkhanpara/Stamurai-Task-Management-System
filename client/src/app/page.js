import Image from "next/image";

export default function Home() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  // If no token, redirect to login
  if (!token) {
    redirect('/login');
  }
  return (
    <h1>Welcome to dashboard</h1>
  );
}
