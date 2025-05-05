import React, { useState, useEffect } from "react"; 
import axios from "axios";
import Sidebar from "./Sidebar";
import jsPDF from "jspdf";  // Import jsPDF

const EleveList = () => {
  const [eleves, setEleves] = useState([]);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [selectedSousClasse, setSelectedSousClasse] = useState("");
 
  useEffect(() => {
    fetchEleves();
  }, []);

  const fetchEleves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/eleves");
      setEleves(res.data);
    } catch (error) {
      console.error("Erreur chargement des élèves :", error);
    }
  };

  const groupedEleves = eleves.reduce((acc, eleve) => {
    const [niveau, sousClasse] = eleve.classe.split(" (");
    const sousClasseNumber = sousClasse.replace(")", "");

    if (!acc[niveau]) {
      acc[niveau] = [];
    }

    if (!acc[niveau].includes(sousClasseNumber)) {
      acc[niveau].push(sousClasseNumber);
    }
    return acc;
  }, {});

  const handleNiveauChange = (event) => {
    setSelectedNiveau(event.target.value);
    setSelectedSousClasse("");
  };

  const handleSousClasseChange = (event) => {
    setSelectedSousClasse(event.target.value);
  };

 
  const filteredEleves = selectedNiveau && selectedSousClasse 
    ? eleves.filter(eleve => 
        eleve.classe === `${selectedNiveau} (${selectedSousClasse})`
      ) 
    : [];

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Define columns and data
    const columns = ["Numero","Nom", "Prénom", "Absence"];
    const rows = filteredEleves.map((eleve, index) => [
      index + 1, // Numbering from 1 to n
      eleve.nom,
      eleve.prenom,
     ]);

    // Add title
    doc.text("Liste des Élèves avec Absences", 14, 10);

    // Add table
    let startY = 20;
    const rowHeight = 10;
    const cellWidth = 40;

    // Draw column headers
    columns.forEach((col, index) => {
      doc.text(col, 14 + index * cellWidth, startY);
    });

    // Draw rows
    rows.forEach((row, rowIndex) => {
      startY += rowHeight;
      row.forEach((cell, colIndex) => {
        doc.text(String(cell), 14 + colIndex * cellWidth, startY);
      });
    });

    // Save the PDF
    doc.save("eleves_avec_absences.pdf");
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto" style={{ maxWidth: "80%" }}>
        <div className="container mt-4 p-4">
          <h2 className="mb-4">Liste des Élèves</h2>

          {/* Niveau Selection */}
          <div className="mb-4">
            <h3>Choisissez un niveau :</h3>
            <select 
              className="form-select" 
              value={selectedNiveau} 
              onChange={handleNiveauChange}
            >
              <option value="">-- Sélectionnez un niveau --</option>
              {Object.keys(groupedEleves).map((niveau) => (
                <option key={niveau} value={niveau}>
                  {niveau}
                </option>
              ))}
            </select>
          </div>

          {/* Sous-classe Selection */}
          {selectedNiveau && (
            <div className="mb-4">
              <h3>Choisissez une sous-classe :</h3>
              <select 
                className="form-select" 
                value={selectedSousClasse} 
                onChange={handleSousClasseChange}
              >
                <option value="">-- Sélectionnez une sous-classe --</option>
                {groupedEleves[selectedNiveau]?.map((sousClasse) => (
                  <option key={sousClasse} value={sousClasse}>
                    {sousClasse}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Table */}
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date de Naissance</th>
                <th>Classe</th>
              
              </tr>
            </thead>
            <tbody>
              {filteredEleves?.length > 0 ? (
                filteredEleves.map((eleve, index) => (
                  <tr key={eleve._id}>
                    <td>{index + 1}</td>
                    <td>{eleve.nom}</td>
                    <td>{eleve.prenom}</td>
                    <td>{new Date(eleve.dateNaissance).toLocaleDateString()}</td>
                    <td>{eleve.classe}</td>
                    
                  
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Aucune élève trouvé pour cette classe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Download PDF Button */}
          <button className="btn btn-primary" onClick={downloadPDF}>
            Télécharger en PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EleveList;
