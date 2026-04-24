// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { api } from "@/lib/api";

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await api.login(email, password);

//       // localStorage.setItem("parkpro_token", res.data.token);
//       // localStorage.setItem("parkpro_admin", JSON.stringify(res.data.admin));
//       router.push("/admin/dashboard");
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center"
//       style={{
//         background:
//           "linear-gradient(135deg, var(--primary-dark, #142a45) 0%, var(--primary, #1e3a5f) 100%)",
//       }}
//     >
//       <div
//         className="w-full max-w-md p-8 rounded-2xl shadow-2xl animate-slide-up"
//         style={{ background: "var(--card)" }}
//       >
//         <div className="text-center mb-8">
//           <div
//             className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
//             style={{
//               background:
//                 "linear-gradient(135deg, var(--primary), var(--primary-light))",
//             }}
//           >
//             PP
//           </div>
//           <h1
//             className="text-2xl font-bold"
//             style={{ color: "var(--foreground)" }}
//           >
//             Admin Login
//           </h1>
//           <p
//             className="text-sm mt-1"
//             style={{ color: "var(--muted-foreground)" }}
//           >
//             Sign in to manage your parking
//           </p>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label
//               className="block text-sm font-medium mb-1.5"
//               style={{ color: "var(--foreground)" }}
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="admin@parkpro.com"
//               className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
//               style={{
//                 background: "var(--muted)",
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//               }}
//               required
//             />
//           </div>
//           <div>
//             <label
//               className="block text-sm font-medium mb-1.5"
//               style={{ color: "var(--foreground)" }}
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2"
//               style={{
//                 background: "var(--muted)",
//                 borderColor: "var(--border)",
//                 color: "var(--foreground)",
//               }}
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 rounded-xl text-white font-bold transition-all hover:opacity-90 disabled:opacity-50"
//             style={{
//               background:
//                 "linear-gradient(135deg, var(--primary), var(--primary-light))",
//             }}
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.login(form.email, form.password);

      // Ideally backend sets cookie → no localStorage needed
      // localStorage.setItem("parkpro_token", res.data.token);
      // localStorage.setItem("parkpro_admin", JSON.stringify(res.data.admin));

      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-primary-light to-primary px-4">
      <Card className="w-full max-w-md shadow-2xl p-8">
        <CardHeader className="text-center p-0 mb-2 flex flex-col items-center">
          {/* <Link
            href="/"
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 bg-[linear-gradient(135deg,var(--primary-dark,#142a45)_0%,var(--primary-light,#2d5f8b)_100%)]"
          >
            PP
          </Link> */}
          <Link href="/" className="flex items-center justify-center gap-2 w-fit">
            <Image src="/logo.svg" alt="Logo"  width={200} height={50} />
          </Link>

          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription className="text-sm">
            Sign in to manage your parking
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
