import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./NavBar";

const AdminDashboard = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="w-100">
        <Navbar />
        <div className="container mt-4" style={{ marginLeft: "250px" }}>
          <h2>Bienvenue sur le tableau de bord Admin</h2>
          <p>Gérez les enseignants, élèves, classes et plus encore.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
