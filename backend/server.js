require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// 📌 Vérifier si la variable d'environnement MONGO_URI est définie
if (!process.env.MONGO_URI) {
  console.error("❌ ERREUR: La variable d'environnement MONGO_URI est manquante !");
  process.exit(1); // Arrêter le serveur
}

// 📌 Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connexion à MongoDB réussie !"))
  .catch((err) => {
    console.error("❌ Erreur lors de la connexion à MongoDB :", err);
    process.exit(1);
  });

// 📌 Importation des routes
console.log("🔄 Initialisation des routes...");

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/matieres", require("./routes/matieres"));
app.use("/api/professeurs", require("./routes/Professeurs")); // Correction de la casse
app.use("/api/eleves", require("./routes/eleve")); // Correction pour correspondre au fichier

console.log("✅ Toutes les routes ont été chargées avec succès !");

// 📌 Route de test pour vérifier si le serveur fonctionne
app.get("/", (req, res) => {
  res.send("🚀 Serveur Express opérationnel !");
});

// 📌 Gestion des routes inexistantes (404)
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route non trouvée" });
});

// 📌 Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT} !`));
