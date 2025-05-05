import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token et le rôle de localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Rediriger vers la page de connexion
    navigate("/login-professeur");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/professeur/dashboard">
          Tableau de bord
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/professeur/eleves">
                Gérer les élèves
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/professeur/notes">
                Gérer les notes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/professeur/absences">
                Gérer les absences
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <button className="btn btn-danger" onClick={handleLogout}>
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;