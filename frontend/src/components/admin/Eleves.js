import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./Sidebar";

const Eleves = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // États pour le formulaire manuel
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [classe, setClasse] = useState(""); // Nom de la classe
  const [classes, setClasses] = useState([]); 

  // Récupération des classes depuis l'API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/classes");
        setClasses(response.data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des classes :", error);
        toast.error("Impossible de récupérer les classes !");
      }
    };

    fetchClasses();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier !");
      return;
    }

    console.log("📂 Fichier sélectionné :", file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/eleves/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Réponse du serveur :", response.data);
      toast.success(response.data.message || "Importation réussie !");
    } catch (error) {
      console.error("❌ Erreur lors de l'import :", error.response?.data);
      toast.error(error.response?.data?.error || "Erreur d'importation !");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEleve = async () => {
    if (!nom || !prenom || !dateNaissance || !classe) {
      toast.error("Tous les champs sont obligatoires !");
      return;
    }

    try {
      // On envoie le nom de la classe, pas son ID
      const response = await axios.post("http://localhost:5000/api/eleves", {
        nom,
        prenom,
        dateNaissance,
        classe, // Utilisation du nom de la classe
      });

      toast.success("Élève ajouté avec succès !");
      console.log("✅ Élève ajouté :", response.data);

      // Réinitialiser le formulaire
      setNom("");
      setPrenom("");
      setDateNaissance("");
      setClasse(""); // Réinitialiser la classe
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout :", error.response?.data);
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout !");
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 ms-auto" style={{ maxWidth: "80%" }}>
        <div className="container mt-4 p-4">
          <h2 className="mb-4">Gestion des Élèves</h2>

          {/* Formulaire d'ajout manuel */}
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
                <input type="date" className="form-control" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
              </div>
              <div className="col">
                <select className="form-select" value={classe} onChange={(e) => setClasse(e.target.value)}>
                  <option value="">Sélectionner une classe</option>
                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <option key={cls._id} value={cls.nom}> {/* Changer ici pour envoyer le nom de la classe */}
                        {cls.nom || `${cls.level} (${cls.number})`} {/* Afficher le nom de la classe ici */}
                      </option>
                    ))
                  ) : (
                    <option disabled>Aucune classe disponible</option>
                  )}
                </select>
              </div>
            </div>
            <button onClick={handleAddEleve} className="btn btn-success">Ajouter Élève</button>
          </div>
          <div class="alert alert-danger">
    <strong>Attention !</strong> Le fichier Excel ou CSV doit obligatoirement être formaté comme suit :  
       <br/> <strong>CNI | Nom | Prénom | Date de Naissance | Classe</strong>
</div>

          <h2 className="mb-4">Importer des élèves</h2>
          <div className="card p-4 shadow-lg">
            <input type="file" className="form-control mb-3" accept=".csv, .xls, .xlsx" onChange={handleFileChange} />
            <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
              {loading ? "Importation..." : "Importer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eleves;
