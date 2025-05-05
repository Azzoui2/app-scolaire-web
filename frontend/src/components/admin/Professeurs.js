import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";

const Professeurs = () => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [matiere, setMatiere] = useState("");
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedClassNames, setSelectedClassNames] = useState([]);
  const [classesAttribuees, setClassesAttribuees] = useState(new Set());
  const [idRecrut, setIdRecrut] = useState("");
  const [grade, setGrade] = useState("");
  const [dateInscription, setDateInscription] = useState("");

  useEffect(() => {
    fetchMatieres();
    fetchClasses();
  }, []);

  const fetchMatieres = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matieres");
      setMatieres(res.data);
    } catch (error) {
      console.error("Erreur chargement des matières :", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/classes");
      setClasses(res.data);
    } catch (error) {
      console.error("Erreur chargement des classes :", error);
    }
  };

  const fetchClassesAttribuees = useCallback(async () => {
    if (!matiere) return;

    try {
      const resProfesseurs = await axios.get("http://localhost:5000/api/professeurs");
      const classesOccupees = new Set();

      resProfesseurs.data.forEach((prof) => {
        if (prof.matiere === matiere) {
          prof.classes.forEach((cls) => classesOccupees.add(cls));
        }
      });

      setClassesAttribuees(classesOccupees);
    } catch (error) {
      console.error("Erreur chargement des classes attribuées :", error);
    }
  }, [matiere]);

  useEffect(() => {
    fetchClassesAttribuees();
  }, [fetchClassesAttribuees]);

  const handleClassChange = (classId, className) => {
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(selectedClasses.filter((id) => id !== classId));
      setSelectedClassNames(selectedClassNames.filter((name) => name !== className));
    } else if (!classesAttribuees.has(classId)) {
      setSelectedClasses([...selectedClasses, classId]);
      setSelectedClassNames([...selectedClassNames, className]);
    } else {
      alert("Cette classe est déjà attribuée à un autre professeur de la même matière !");
    }
  };

  const handleAddProf = async () => {
    if (!nom || !prenom || !email || !telephone || !password || !matiere || selectedClasses.length === 0 || !idRecrut || !grade || !dateInscription) {
      alert("Veuillez remplir tous les champs !");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/api/professeurs", {
        nom,
        prenom,
        email,
        telephone,
        password, // Inclure le mot de passe
        matiere,
        classes: selectedClasses,
        classNames: selectedClassNames,
        id_recrut: idRecrut,
        grade,
        date_inscription: dateInscription,
      });
  
      alert("Professeur ajouté !");
      // Réinitialiser les champs après l'ajout
      setNom("");
      setPrenom("");
      setEmail("");
      setTelephone("");
      setPassword("");
      setMatiere("");
      setSelectedClasses([]);
      setSelectedClassNames([]);
      setIdRecrut("");
      setGrade("");
      setDateInscription("");
    } catch (error) {
      console.error("Erreur ajout professeur :", error);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto" style={{ maxWidth: "80%" }}>
        <div className="container mt-4 p-4">
          <h2 className="mb-4">Gestion des Professeurs</h2>

          <div className="mb-4">
            <div className="row mb-3">
              <div className="col">
                <input type="text" className="form-control" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
              <div className="col">
                <input type="text" className="form-control" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col">
                <input type="text" className="form-control" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Matière</label>
              <select className="form-select" value={matiere} onChange={(e) => setMatiere(e.target.value)}>
                <option value="">Sélectionner une matière</option>
                {matieres.map((mat) => (
                  <option key={mat._id} value={mat._id}>{mat.nom}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Classes</label>
              <div className="d-flex flex-wrap">
                {classes.map((cls) => {
                  const classNameFormatted = `${cls.level} (${cls.number})`;
                  const isDisabled = classesAttribuees.has(cls._id);

                  return (
                    <div key={cls._id} className="form-check me-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={cls._id}
                        checked={selectedClasses.includes(cls._id)}
                        disabled={isDisabled}
                        onChange={() => handleClassChange(cls._id, classNameFormatted)}
                      />
                      <label className={`form-check-label ${isDisabled ? "text-muted" : ""}`}>
                        {classNameFormatted} {isDisabled && "(Déjà attribuée)"}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <input type="text" className="form-control" placeholder="ID Recrutement" value={idRecrut} onChange={(e) => setIdRecrut(e.target.value)} />
              </div>
              <div className="col">
                <input type="text" className="form-control" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
              </div>
              <div className="col">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Date d'inscription</label>
              <input type="date" className="form-control" value={dateInscription} onChange={(e) => setDateInscription(e.target.value)} />
            </div>

            <button onClick={handleAddProf} className="btn btn-success">Ajouter Professeur</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Professeurs;