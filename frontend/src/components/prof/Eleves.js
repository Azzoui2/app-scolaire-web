import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./NavBar";

const Eleves = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [elevesError, setElevesError] = useState("");
  const [notes, setNotes] = useState({});
  const [absences, setAbsences] = useState({});

  // Récupérer les classes du professeur
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token manquant.");

        const response = await axios.get("http://localhost:5000/api/professeurs/eleves", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClasses(response.data.classes);
      } catch (error) {
        console.error("Erreur lors de la récupération des classes :", error);
        setError(error.response?.data?.message || "Erreur lors de la récupération des classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Récupérer les élèves de la classe sélectionnée
  const fetchElevesByClasse = async (classeNom) => {
    if (!classeNom) return;
    setEleves([]);
    setElevesError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant.");

      console.log(`📌 Requête envoyée pour la classe : ${classeNom}`);

      const response = await axios.get(`http://localhost:5000/api/eleves/${classeNom}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`✅ Élèves reçus pour la classe "${classeNom}" :`, response.data.eleves);
      setEleves(response.data.eleves);
      

      // Initialisation des notes et absences
      const initialNotes = {};
      const initialAbsences = {};
      response.data.eleves.forEach((eleve) => {
        initialNotes[eleve._id] = eleve.notes || [];
        initialAbsences[eleve._id] = eleve.absences || [];
      });

      setNotes(initialNotes);
      setAbsences(initialAbsences);

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des élèves :", error);
      setElevesError(error.response?.data?.message || "Erreur lors de la récupération des élèves.");
    }
  };

  // Gérer le changement de classe sélectionnée
  const handleClasseChange = (event) => {
    const classeNom = event.target.value;
    console.log(`📌 Classe sélectionnée : ${classeNom}`);
    setSelectedClasse(classeNom);
    fetchElevesByClasse(classeNom);
  };

  // Ajouter une note
  const handleAddNote = (eleveId, note) => {
    if (!note) return;
    setNotes((prevNotes) => ({
      ...prevNotes,
      [eleveId]: [...(prevNotes[eleveId] || []), note],
    }));
  };

  // Supprimer une note
  const handleRemoveNote = (eleveId, index) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [eleveId]: prevNotes[eleveId].filter((_, i) => i !== index),
    }));
  };

  // Ajouter une absence
  const handleAddAbsence = (eleveId, date) => {
    if (!date) return;
    setAbsences((prevAbsences) => ({
      ...prevAbsences,
      [eleveId]: [...(prevAbsences[eleveId] || []), date],
    }));
  };

  // Enregistrer les modifications sur le serveur
  const handleSave = async (eleveId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token manquant.");

      const updatedData = {
        notes: notes[eleveId],
        absences: absences[eleveId],
      };

      await axios.put(`http://localhost:5000/api/eleves/${eleveId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Modifications enregistrées avec succès !");
      alert("Modifications enregistrées !");
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour :", error);
      alert("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <div>Chargement en cours...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h1>Gérer les élèves</h1>

        {/* Sélecteur de classe */}
        <div className="mb-4">
          <label htmlFor="classe-select" className="form-label">Sélectionnez une classe :</label>
          <select id="classe-select" className="form-select" onChange={handleClasseChange} defaultValue="">
            <option value="" disabled>Sélectionnez une classe</option>
            {classes.map((classe) => (
            <option key={classe._id} value={`${classe.level} (${classe.number})`}>
            {classe.level} ({classe.number})
          </option>
          
            ))}
          </select>
        </div>

        {/* Affichage des élèves */}
        {selectedClasse && (
          <div className="mb-4">
            <h2>Classe : {selectedClasse}</h2>

            {elevesError ? (
              <div className="alert alert-danger">{elevesError}</div>
            ) : (
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Notes</th>
                    <th>Absences</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eleves.map((eleve) => (
                    <tr key={eleve._id}>
                      <td>{eleve.nom}</td>
                      <td>{eleve.prenom}</td>

                      {/* Notes */}
                      <td>
                        {notes[eleve._id]?.map((note, index) => (
                          <span key={index} className="badge bg-primary me-1">
                            {note} <button onClick={() => handleRemoveNote(eleve._id, index)} className="btn btn-sm btn-danger">x</button>
                          </span>
                        ))}
                        <input type="number" className="form-control" onBlur={(e) => handleAddNote(eleve._id, e.target.value)} placeholder="Ajouter note" />
                      </td>

                      {/* Absences */}
                      <td>
                        {absences[eleve._id]?.map((date, index) => (
                          <span key={index} className="badge bg-warning me-1">{date}</span>
                        ))}
                        <input type="date" className="form-control" onBlur={(e) => handleAddAbsence(eleve._id, e.target.value)} />
                      </td>

                      {/* Bouton Enregistrer */}
                      <td>
                        <button className="btn btn-success" onClick={() => handleSave(eleve._id)}>Enregistrer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Eleves;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "./NavBar";

// const Eleves = () => {
//   const [classes, setClasses] = useState([]);
//   const [selectedClasse, setSelectedClasse] = useState("");
//   const [eleves, setEleves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [elevesError, setElevesError] = useState("");

//   // Récupérer les classes du professeur
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) throw new Error("Token manquant.");

//         const response = await axios.get("http://localhost:5000/api/professeurs/eleves", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setClasses(response.data.classes);
//       } catch (error) {
//         setError(error.response?.data?.message || "Erreur lors de la récupération des classes.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClasses();
//   }, []);

//   // Récupérer les élèves de la classe sélectionnée
//   const fetchElevesByClasse = async (classeNom) => {
//     if (!classeNom) return;
//     setEleves([]);
//     setElevesError("");

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Token manquant.");

//       const response = await axios.get(`http://localhost:5000/api/eleves/${classeNom}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setEleves(response.data.eleves);
//     } catch (error) {
//       setElevesError(error.response?.data?.message || "Erreur lors de la récupération des élèves.");
//     }
//   };

//   // Gérer le changement de classe sélectionnée
//   const handleClasseChange = (event) => {
//     const classeNom = event.target.value;
//     setSelectedClasse(classeNom);
//     fetchElevesByClasse(classeNom);
//   };

//   // Ajouter une note à un élève
//   const ajouterNote = async (eleveId) => {
//     const nouvelleNote = prompt("Entrez la nouvelle note :");
//     if (!nouvelleNote) return;

//     try {
//       await axios.post(`http://localhost:5000/api/eleves/${eleveId}/ajouter-note`, { note: nouvelleNote });
//       setEleves((prevEleves) =>
//         prevEleves.map((eleve) =>
//           eleve._id === eleveId ? { ...eleve, notes: [...(eleve.notes || []), nouvelleNote] } : eleve
//         )
//       );
//     } catch (error) {
//       console.error("Erreur lors de l'ajout de la note :", error);
//     }
//   };

//   // Modifier une note existante
//   const modifierNote = async (eleveId, index, nouvelleValeur) => {
//     try {
//       await axios.put(`http://localhost:5000/api/eleves/${eleveId}/modifier-note`, {
//         index,
//         note: nouvelleValeur,
//       });

//       setEleves((prevEleves) =>
//         prevEleves.map((eleve) =>
//           eleve._id === eleveId
//             ? { ...eleve, notes: eleve.notes.map((n, i) => (i === index ? nouvelleValeur : n)) }
//             : eleve
//         )
//       );
//     } catch (error) {
//       console.error("Erreur lors de la modification de la note :", error);
//     }
//   };

//   // Ajouter une absence avec la date et l'heure actuelles
//   const ajouterAbsence = async (eleveId) => {
//     const date = new Date();
//     const absence = {
//       date: date.toLocaleDateString(),
//       heure: date.toLocaleTimeString(),
//     };

//     try {
//       await axios.post(`http://localhost:5000/api/eleves/${eleveId}/ajouter-absence`, absence);
//       setEleves((prevEleves) =>
//         prevEleves.map((eleve) =>
//           eleve._id === eleveId ? { ...eleve, absences: [...(eleve.absences || []), absence] } : eleve
//         )
//       );
//     } catch (error) {
//       console.error("Erreur lors de l'ajout de l'absence :", error);
//     }
//   };

//   if (loading) return <div>Chargement en cours...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;

//   return (
//     <div>
//       <Navbar />
//       <div className="container mt-4">
//         <h1>Gérer les élèves</h1>

//         {/* Sélecteur de classe */}
//         <div className="mb-4">
//           <label htmlFor="classe-select" className="form-label">Sélectionnez une classe :</label>
//           <select id="classe-select" className="form-select" onChange={handleClasseChange} defaultValue="">
//             <option value="" disabled>Sélectionnez une classe</option>
//             {classes.map((classe) => (
//               <option key={classe._id} value={classe.level}>
//                 {classe.level} ({classe.number})
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Affichage des élèves */}
//         {selectedClasse && (
//           <div className="mb-4">
//             <h2>Classe : {selectedClasse}</h2>

//             {elevesError ? (
//               <div className="alert alert-danger">{elevesError}</div>
//             ) : (
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>Nom</th>
//                     <th>Prénom</th>
//                     <th>Date de naissance</th>
//                     <th>Notes</th>
//                     <th>Absences</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Array.isArray(eleves) && eleves.length > 0 ? (
//                     eleves.map((eleve) => (
//                       <tr key={eleve._id}>
//                         <td>{eleve.nom}</td>
//                         <td>{eleve.prenom}</td>
//                         <td>{eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString() : "N/A"}</td>
//                         <td>
//                           {Array.isArray(eleve.notes) && eleve.notes.length > 0 ? (
//                             eleve.notes.map((note, index) => (
//                               <div key={index}>
//                                 <input
//                                   type="number"
//                                   value={note}
//                                   onChange={(e) => modifierNote(eleve._id, index, e.target.value)}
//                                 />
//                               </div>
//                             ))
//                           ) : (
//                             <span>Aucune note</span>
//                           )}
//                           <button onClick={() => ajouterNote(eleve._id)} className="btn btn-sm btn-primary mt-1">
//                             + Ajouter
//                           </button>
//                         </td>
//                         <td>
//                           {Array.isArray(eleve.absences) && eleve.absences.length > 0 ? (
//                             eleve.absences.map((absence, index) => (
//                               <div key={index}>{absence.date} - {absence.heure}</div>
//                             ))
//                           ) : (
//                             <span>Aucune absence</span>
//                           )}
//                         </td>
//                         <td>
//                           <button onClick={() => ajouterAbsence(eleve._id)} className="btn btn-sm btn-warning">
//                             Ajouter Absence
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="text-center">Aucun élève trouvé.</td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Eleves;





// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./NavBar";

// const Eleves = () => {
//   const [classes, setClasses] = useState([]);
//   const [selectedClasse, setSelectedClasse] = useState(null);
//   const [eleves, setEleves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [elevesError, setElevesError] = useState("");
//   const navigate = useNavigate();

//   // Récupérer les classes du professeur
//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) throw new Error("Token manquant.");

//         const response = await axios.get("http://localhost:5000/api/professeurs/eleves", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setClasses(response.data.classes);
//       } catch (error) {
//         console.error("Erreur lors de la récupération des classes :", error);
//         if (error.response?.status === 401) {
//           localStorage.removeItem("token");
//           localStorage.removeItem("role");
//           navigate("/login-professeur");
//         } else {
//           setError(error.response?.data?.message || "Erreur lors de la récupération des classes.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClasses();
//   }, [navigate]);

//   // Récupérer les élèves de la classe sélectionnée
//   const fetchElevesByClasse = async (classeId) => {
//     if (!classeId) return; // Évite les requêtes inutiles
//     setEleves([]);
//     setElevesError("");
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Token manquant.");

//       const response = await axios.get(`http://localhost:5000/api/eleves/${classeId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setSelectedClasse(response.data.classe);
//       setEleves(response.data.eleves);
//     } catch (error) {
//       console.error("Erreur lors de la récupération des élèves :", error);
//       setElevesError(error.response?.data?.message || "Erreur lors de la récupération des élèves.");
//     }
//   };

//   // Gérer le changement de classe sélectionnée
//   const handleClasseChange = (event) => {
//     const classeId = event.target.value;
//     setSelectedClasse(null);
//     fetchElevesByClasse(classeId);
//   };

//   if (loading) return <div>Chargement en cours...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;

//   return (
//     <div>
//       <Navbar />
//       <div className="container mt-4">
//         <h1>Gérer les élèves</h1>

//         {/* Sélecteur de classe */}
//         <div className="mb-4">
//           <label htmlFor="classe-select" className="form-label">Sélectionnez une classe :</label>
//           <select id="classe-select" className="form-select" onChange={handleClasseChange} defaultValue="">
//             <option value="" disabled>Sélectionnez une classe</option>
//             {classes.map((classe) => (
//               <option key={classe._id} value={classe._id}>
//                 {classe.level} ({classe.number})
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Affichage des élèves de la classe sélectionnée */}
//         {selectedClasse && (
//           <div className="mb-4">
//             <h2>Classe : {selectedClasse.level} ({selectedClasse.number})</h2>

//             {elevesError ? (
//               <div className="alert alert-danger">{elevesError}</div>
//             ) : (
//               <table className="table table-striped">
//                 <thead>
//                   <tr>
//                     <th>Nom</th>
//                     <th>Prénom</th>
//                     <th>Date de naissance</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {eleves.map((eleve) => (
//                     <tr key={eleve._id}>
//                       <td>{eleve.nom}</td>
//                       <td>{eleve.prenom}</td>
//                       <td>{new Date(eleve.dateNaissance).toLocaleDateString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Eleves;
