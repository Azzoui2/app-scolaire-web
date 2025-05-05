import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Matieres = () => {
  const [matieres, setMatieres] = useState([]);
  const [nom, setNom] = useState("");

  useEffect(() => {
    fetchMatieres();
  }, []);

  // Récupérer la liste des matières depuis l'API
  const fetchMatieres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matieres");
      setMatieres(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des matières :", error);
    }
  };

  // Ajouter une matière
  const handleAddMatiere = async () => {
    if (!nom.trim()) {
      alert("Veuillez entrer un nom de matière !");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/matieres", { nom });
      setNom(""); // Réinitialiser le champ
      fetchMatieres();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
    }
  };

  // Supprimer une matière
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cette matière ?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/matieres/${id}`);
      fetchMatieres();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto" style={{ maxWidth: "80%" }}>
        <div className="container mt-4 p-4">
          <h2 className="mb-4">Gestion des Matières</h2>

          {/* Ajouter une matière (sur une seule ligne) */}
          <div className="d-flex align-items-center mb-4">
            <label className="me-2">Matière</label>
            <input
              type="text"
              className="form-control me-3"
              placeholder="Ex: Mathématiques"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
            <button onClick={handleAddMatiere} className="btn btn-success">
              Ajouter
            </button>
          </div>

          {/* Liste des matières */}
          <h4>Liste des matières</h4>
          <table className="table table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Matière</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map((matiere) => (
                <tr key={matiere._id}>
                  <td>{matiere.nom}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(matiere._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Matieres;
