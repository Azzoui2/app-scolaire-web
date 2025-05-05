import React from "react";
import Navbar from "./NavBar";

const ProfesseurDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1>Bienvenue sur le tableau de bord des Professeurs</h1>
        <p>Gérez vos classes et vos matières ici.</p>
      </div>
    </div>
  );
};

export default ProfesseurDashboard;