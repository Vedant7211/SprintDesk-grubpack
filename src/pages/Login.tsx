import React, { useEffect, useState } from "react";
import { login, refreshAccessToken } from "../api/auth";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { Activity, Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const refreshSession = async () => {
      if (refreshToken) {
        try {
          await refreshAccessToken(refreshToken);
        } catch {
          // Silent catch
        }
      }
    };
    refreshSession();
  }, [refreshToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login({ username, password });
      setAuth(response);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        
        {/* Brand */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
            <Activity size={20} color="white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">SprintDesk</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. emilys"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
           <p className="text-xs text-gray-400">
             Mock data: <span className="font-medium text-gray-500">emilys / emilyspass</span>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
