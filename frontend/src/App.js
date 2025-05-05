import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/admin/Login";
import LoginProfesseur from "./components/prof/LoginProfesseur";

import Eleves_prof from "./components/prof/Eleves";
import Absences from "./components/prof/Absences";
import Notes from "./components/prof/Notes";

import AdminDashboard from "./components/admin/AdminDashboard";
import ProfesseurDashboard from "./components/prof/ProfesseurDashboard";
import PrivateRoute from "./components/admin/PrivateRoute";
import Classes from "./components/admin/Classes";
import Matieres from "./components/admin/Matieres";
import Professeurs from "./components/admin/Professeurs";
import ProfesseursList from "./components/admin/ProfesseurList"; // Correction du nom d'import
import EleveList from "./components/admin/EleveList";
import Eleves from "./components/admin/Eleves";
import Statistique from "./components/admin/Statistique";

const getUserRole = () => {
  return localStorage.getItem("role")?.trim(); // Évite les espaces indésirables
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pages de connexion */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-professeur" element={<LoginProfesseur />} />

        {/* Routes pour l'admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/classes" element={<PrivateRoute role="admin"><Classes /></PrivateRoute>} />
        <Route path="/admin/professeurs" element={<PrivateRoute role="admin"><Professeurs /></PrivateRoute>} />
        <Route path="/admin/professeurslist" element={<PrivateRoute role="admin"><ProfesseursList /></PrivateRoute>} />
        <Route path="/admin/eleves" element={<PrivateRoute role="admin"><Eleves /></PrivateRoute>} />
        <Route path="/admin/elevelist" element={<PrivateRoute role="admin"><EleveList /></PrivateRoute>} />
        <Route path="/admin/stat" element={<PrivateRoute role="admin"><Statistique /></PrivateRoute>} />
        <Route path="/admin/matieres" element={<PrivateRoute role="admin"><Matieres /></PrivateRoute>} />

        {/* Routes pour les professeurs */}
        <Route path="/professeur/dashboard" element={<PrivateRoute role="professeur"><ProfesseurDashboard /></PrivateRoute>} />
        <Route path="/professeur/absences" element={<PrivateRoute role="professeur"><Absences /></PrivateRoute>} />
        <Route path="/professeur/notes" element={<PrivateRoute role="professeur"><Notes /></PrivateRoute>} />
        <Route path="/professeur/eleves" element={<PrivateRoute role="professeur"><Eleves_prof /></PrivateRoute>} />

        {/* Redirection dynamique en fonction du rôle de l'utilisateur */}
        <Route path="/" element={
          getUserRole() === "admin" ? <Navigate to="/admin" /> :
          getUserRole() === "professeur" ? <Navigate to="/professeur/dashboard" /> :
          <Navigate to="/login" />
        } />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
