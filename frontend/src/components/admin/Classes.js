import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [level, setLevel] = useState("1er collège"); // Valeur par défaut

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClasses(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des classes :", error.response?.data || error.message);
    }
  };

  const handleAddClass = async () => {
    try {
      await axios.post("http://localhost:5000/api/classes", { level });
      fetchClasses();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/classes/${id}`);
        fetchClasses();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error.response?.data || error.message);
      }
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto" style={{ maxWidth: "80%" }}>
        <div className="container mt-4 p-4">
          <h2 className="mb-4">Gestion des Classes</h2>

          {/* Sélection du niveau + ajout */}
          <span className="d-flex align-items-center gap-3 mb-4">
            <label className="form-label mb-0">Niveau:</label>

            <select
                className="form-select w-auto"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
            >
                <option value="1er collège">1er collège</option>
                <option value="2e collège">2e collège</option>
                <option value="3e collège">3e collège</option>
            </select>

            <button onClick={handleAddClass} className="btn btn-success">
                Ajouter Classe
            </button>
            </span>


          {/* Liste des classes */}
          <div className="col-md-12">
            <h4>Liste des classes</h4>
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Classe</th>
                  <th>Numéro</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classe) => (
                  <tr key={classe._id}>
                    <td>{classe.level}</td>
                    <td>{classe.number}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(classe._id)}
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
    </div>
  );
};

export default Classes;
