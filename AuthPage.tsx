import { useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        await signUp(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError("Invalid email or password.");
      } else if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#0ea5e9" />
              <path d="M16 8 L22 12 L22 20 L16 24 L10 20 L10 12 Z" fill="white" fillOpacity="0.9" />
              <circle cx="16" cy="16" r="3" fill="#0ea5e9" />
            </svg>
          </div>
          <h1 className="auth-title">SafeSpace AI</h1>
          <p className="auth-subtitle">AI-powered urban safety evaluation platform</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Minimum 6 characters" : "Your password"}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "New to SafeSpace AI? " : "Already have an account? "}
            <button
              className="link-btn"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="auth-features">
          <div className="auth-feature">
            <span className="feature-icon">🗺</span>
            <span>Real-time safety map</span>
          </div>
          <div className="auth-feature">
            <span className="feature-icon">📊</span>
            <span>AI recommendations</span>
          </div>
          <div className="auth-feature">
            <span className="feature-icon">🛡</span>
            <span>Planner dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
