import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");

    
  };

  return (
    <div className="bg-dark text-white vh-100 p-3 position-fixed" style={{ width: "250px" }}>
      <h4 className="text-center py-3">Admin Panel</h4>
      <ul className="nav flex-column">
        {/* <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/enseignement">Gestion de l'Enseignement</Link>
        </li> */}
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/eleves">Gestion des Élèves</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/classes">Gestion des Classes</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/professeurs">Gestion des Professeurs</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/matieres">Gestion des Matières</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/professeursList">La list de Professeurs </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/EleveList">La list de eleves </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/admin/stat">Statistique </Link>
        </li>
      </ul>
      <button className="btn btn-danger mt-4 w-100" onClick={handleLogout}>Déconnexion</button>
    </div>
  );
};

export default Sidebar;
