import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, Lock, Mail } from "lucide-react";
import { toast } from "@/lib/island-toast-api";
import { ApiError, apiPost, setAuthToken } from "@/lib/api-client";
import { DASHBOARD_BASE } from "@/lib/routes";

interface LoginResponse {
  data: {
    token: string;
    token_type: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = await apiPost<LoginResponse>(
        "/auth/login",
        { email: email.trim(), password },
        { skipAuth: true },
      );
      setAuthToken(payload.data.token);
      localStorage.setItem("userRole", payload.data.user.role);
      toast.success("Logged in successfully");
      navigate(DASHBOARD_BASE);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center mb-4 shadow-sm">
          <CalendarCheck className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
            contact support if you need access
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email" className="text-slate-700">
                Email address
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="ops@gilitour.test"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center bg-teal-500 hover:bg-teal-600 text-white h-11"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Seeded users — run in <code className="text-slate-700">backend/</code>:{" "}
                  <code className="text-slate-700">php artisan db:seed</code>
                </span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">Admin</p>
                <p>admin@gilitour.test</p>
                <p>password</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <p className="font-semibold text-slate-800 mb-1">Operator</p>
                <p>ops@gilitour.test</p>
                <p>password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
