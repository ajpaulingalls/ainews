"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminNavProps {
  user: { name: string; email: string; role: string };
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/articles", label: "Articles" },
    { href: "/admin/articles/new", label: "New Article" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="font-bold text-lg text-gray-900">
              AI News <span className="text-blue-600 text-sm font-normal">Editorial</span>
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              View Site
            </Link>
            <span className="text-sm text-gray-500">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
