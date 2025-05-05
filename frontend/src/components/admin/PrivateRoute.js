import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.trim(); // Supprime les espaces inutiles

  // Si l'utilisateur n'est pas connecté, redirige vers /login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si un rôle est spécifié et que l'utilisateur n'a pas ce rôle, redirige en fonction de son rôle
  if (role && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/professeur/dashboard"} />;
  }

  // Si tout est bon, affiche le composant enfant
  return children;
};

export default PrivateRoute;