import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
  
      if (typeof res.data.token === "string") {
        const role = decodeToken(res.data.token); // Extraire le rôle du token
        if (!role) {
          setError("❌ Erreur : Impossible de décoder le rôle.");
          return;
        }
  
        // Stocker le token et le rôle dans localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", role);
  
        console.log("Rôle extrait du token :", role);
        console.log("Token stocké :", res.data.token);
  
        // Rediriger en fonction du rôle
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "professeur") {
          navigate("/professeur/dashboard");
        } else {
          setError("❌ Rôle non reconnu.");
        }
      } else {
        setError("❌ Erreur : Token non reçu.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message
          ? `❌ ${err.response.data.message}`
          : "❌ Identifiants incorrects ou problème serveur."
      );
    } finally {
      setLoading(false);
    }
  };const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le payload du token
      return payload.role; // Retourner le rôle
    } catch (error) {
      console.error("Erreur lors du décodage du token :", error);
      return null;
    }
  };
  

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Connexion</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
};

export default Login;