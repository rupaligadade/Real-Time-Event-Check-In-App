import React, { useState } from "react";
import useAuthStore from "../store/useAuth";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setToken, token } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      
      const fakeToken = "demo_token_123";
      setToken(fakeToken);

      alert(" Login successful!");
    } catch (error) {
      console.error("Login failed:", error);
      alert(" Login failed!");
    }
  };

  if (token) {
    return <h2>Already logged in </h2>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Login
        </button>
      </form>
    </div>
  );
}