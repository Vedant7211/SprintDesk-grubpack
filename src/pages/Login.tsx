import React, { useEffect, useState } from "react";
import { login } from "../api/auth";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

useEffect(() => {
  const refreshSession = async () => {
    if (refreshToken) {
      const response = await refreshAccessToken(refreshToken);

      console.log("REFRESH RESPONSE:", response);
    }
  };

  refreshSession();
}, [refreshToken]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await login({ username, password });
      setAuth(response);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Invalid credentials");
    }
  };
  return (
    <div className="bg-gray-800 h-screen w-screen flex items-center justify-center">
      <div className="bg-gray-500 h-[80vh] w-[80vw] flex items-center justify-center">
        <form
          className="flex flex-col items-center  justify-center gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            className="border border-gray-300 rounded p-2"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            className="border border-gray-300 rounded p-2"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
