import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Statistique = () => {
  const [stats, setStats] = useState({
    totalEleves: 0,
    elevesParClasse: {},
    totalProfs: 0,
    profsParMatiere: {},
    ratioElevesProfs: "N/A",
    matiereLaPlusEnseignee: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistiques();
  }, []);

  const fetchStatistiques = async () => {
    setLoading(true);
    setError("");

    try {
      const [resEleves, resProfs] = await Promise.all([
        axios.get("http://localhost:5000/api/eleves"),
        axios.get("http://localhost:5000/api/professeurs"),
      ]);

      const eleves = resEleves.data || [];
      const profs = resProfs.data || [];

      const totalEleves = eleves.length;
      const totalProfs = profs.length;

      // Regrouper les élèves par classe
      const elevesParClasse = eleves.reduce((acc, eleve) => {
        acc[eleve.classe] = (acc[eleve.classe] || 0) + 1;
        return acc;
      }, {});

      // Regrouper les professeurs par matière
      const profsParMatiere = profs.reduce((acc, prof) => {
        acc[prof.matiere] = (acc[prof.matiere] || 0) + 1;
        return acc;
      }, {});

      // Calcul du ratio élèves/professeurs
      const ratioElevesProfs = totalProfs > 0 ? (totalEleves / totalProfs).toFixed(2) : "N/A";

      // Trouver la matière la plus enseignée
      const matiereLaPlusEnseignee = Object.entries(profsParMatiere).reduce(
        (max, [matiere, count]) => (count > max.count ? { matiere, count } : max),
        { matiere: "", count: 0 }
      ).matiere;

      setStats({
        totalEleves,
        elevesParClasse,
        totalProfs,
        profsParMatiere,
        ratioElevesProfs,
        matiereLaPlusEnseignee,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error);
      setError("Impossible de charger les statistiques. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto p-4" style={{ maxWidth: "80%" }}>
        <h2 className="mb-4">📊 Statistiques</h2>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Chargement des statistiques...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            {/* Statistiques des élèves */}
            <div className="mb-4">
              <h4>📌 Statistiques des élèves</h4>
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Type</th>
                    <th>Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nombre total d'élèves</td>
                    <td>{stats.totalEleves}</td>
                  </tr>
                  {Object.entries(stats.elevesParClasse).map(([classe, count]) => (
                    <tr key={classe}>
                      <td>Élèves en {classe}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistiques des professeurs */}
            <div className="mb-4">
              <h4>📌 Statistiques des professeurs</h4>
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Matière</th>
                    <th>Nombre de professeurs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nombre total de professeurs</td>
                    <td>{stats.totalProfs}</td>
                  </tr>
                  {Object.entries(stats.profsParMatiere).map(([matiere, count]) => (
                    <tr key={matiere}>
                      <td>{matiere}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistiques globales */}
            <div className="mb-4">
              <h4>📌 Statistiques globales</h4>
              <table className="table table-striped table-bordered">
                <thead className="table-dark">
                  <tr>
                    <th>Statistique</th>
                    <th>Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ratio élèves/professeurs</td>
                    <td>{stats.ratioElevesProfs}</td>
                  </tr>
                  <tr>
                    <td>Matière la plus enseignée</td>
                    <td>{stats.matiereLaPlusEnseignee  }</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistique;
