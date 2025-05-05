import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const ProfesseurList = () => {
  const [professeurs, setProfesseurs] = useState([]);

  useEffect(() => {
    fetchProfesseurs();
  }, []);

  const fetchProfesseurs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/professeurs");
      setProfesseurs(res.data);
    } catch (error) {
      console.error("Erreur chargement des professeurs :", error);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto" style={{ maxWidth: "80%" }}>
        <div className="container mt-4 p-4">
          <h2 className="mb-4">Liste des Professeurs</h2>

          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Telephone</th>
                <th>Matière</th>
                <th>Classes</th>
                <th>Grade</th>
                <th>ID Recrut.</th>
                <th>Anciennete</th>
              </tr>
            </thead>
            <tbody>
              {professeurs.length > 0 ? (
                professeurs.map((prof) => (
                  <tr key={prof._id}>
                    <td>{prof.nom}</td>
                    <td>{prof.prenom}</td>
                    <td>{prof.email}</td>
                    <td>{prof.telephone}</td>
                    <td>{prof.matiere.nom}</td>
                    <td>
                    {prof.classNames
                        ? prof.classNames
                            .map(className => {
                              const match = className.match(/(\d+)[^\d]+.*\((\d+)\)/);
                              if (match) {
                                return `${match[1]}/${match[2]}`; // Convertir "1er collège (2)" en "1/2"
                              }
                              return className; // Garder le format d'origine si le format attendu n'est pas respecté
                            })
                            .join(", ")
                        : "Aucune classe"}

                    </td>
                    <td>{prof.grade}</td>
                    <td>{prof.id_recrut}</td>
                    <td>{new Date().getFullYear() - new Date(prof.date_inscription).getFullYear()} ans</td>
                    </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">Aucun professeur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfesseurList;
