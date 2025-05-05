const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Professeur = require("../models/Professeur");
const Matiere = require("../models/Matiere");
const Classe = require("../models/Class");
const Eleve =  require("../models/Eleve");
const authMiddleware = require("./auth_midd_prof");


const jwt = require("jsonwebtoken");

router.get("/eleves", async (req, res) => {
  try {
    // Récupérer le token de l'en-tête de la requête
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    // Vérifier et décoder le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expiré. Veuillez vous reconnecter." });
      }
      throw error; // Propager les autres erreurs
    }

    // Récupérer le professeur et ses classes
    const professeur = await Professeur.findById(decoded.id).populate("classes");
    if (!professeur) {
      return res.status(404).json({ message: "Professeur non trouvé." });
    }

    // Vérifier si le professeur a des classes
    if (!professeur.classes || professeur.classes.length === 0) {
      return res.status(404).json({ message: "Aucune classe trouvée pour ce professeur." });
    }

    // Récupérer les IDs des classes du professeur
    const classeIds = professeur.classes.map((classe) => classe._id);

    // Récupérer les élèves de toutes les classes du professeur
    const eleves = await Eleve.find({ classe: { $in: classeIds } });

    // Retourner les classes et les élèves
    res.status(200).json({
      classes: professeur.classes.map((classe) => ({
        _id: classe._id,
        level: classe.level,
        number: classe.number,
      })),
      eleves,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des élèves :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des élèves." });
  }
});

 
router.get("/me", async (req, res) => {
  try {
    // Récupérer le token de l'en-tête de la requête
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const professeur = await Professeur.findById(decoded.id);

    if (!professeur) {
      return res.status(404).json({ message: "Professeur non trouvé." });
    }

    // Retourner les données du professeur
    res.status(200).json({
      nom: professeur.nom,
      prenom: professeur.prenom,
      email: professeur.email,
      hasChangedPassword: professeur.hasChangedPassword, // Inclure le champ hasChangedPassword
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des données du professeur :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des données." });
  }
});
// Modifier le mot de passe du professeur
router.post("/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Récupérer le token de l'en-tête de la requête
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const professeur = await Professeur.findById(decoded.id);

    if (!professeur) {
      return res.status(404).json({ message: "Professeur non trouvé." });
    }

    // Vérifier si le mot de passe a déjà été changé
    if (professeur.hasChangedPassword) {
      return res.status(400).json({ message: "Vous avez déjà changé votre mot de passe." });
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(oldPassword, professeur.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect." });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe et le champ hasChangedPassword
    professeur.password = hashedPassword;
    professeur.hasChangedPassword = true; // Marquer que le mot de passe a été changé
    await professeur.save();

    res.status(200).json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("Erreur lors de la modification du mot de passe :", error);
    res.status(500).json({ message: "Erreur serveur lors de la modification du mot de passe." });
  }
});
// Connexion des professeurs
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email existe
    const professeur = await Professeur.findOne({ email });
    if (!professeur) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect." });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, professeur.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect." });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: professeur._id, role: "professeur" }, // Inclure le rôle dans le token
      process.env.JWT_SECRET, // Clé secrète pour signer le token
      { expiresIn: "1h" } // Durée de validité du token
    );

    // Retourner le token et le rôle
    res.status(200).json({ token, role: "professeur" });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
});

// Obtenir la liste des professeurs
router.get("/", async (req, res) => {
  try {
    // Récupérer tous les professeurs avec les détails de la matière et des classes
    const professeurs = await Professeur.find()
      .populate("matiere", "nom") // Récupérer uniquement le nom de la matière
      .populate("classes", "number level"); // Récupérer uniquement le numéro et le niveau de la classe

    // Formater les données pour inclure les noms des classes
    const formattedProfesseurs = professeurs.map((prof) => ({
      ...prof._doc,
      classNames: prof.classes.map((classe) => `${classe.level} (${classe.number})`), // Format : "Level (Number)"
    }));

    res.status(200).json(formattedProfesseurs);
  } catch (error) {
    console.error("Erreur lors de la récupération des professeurs :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des professeurs." });
  }
});

// Ajouter un professeur
router.post("/", async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, matiere, classes, id_recrut, grade, date_inscription } = req.body;

    // Vérifier si l'email existe déjà
    const existingProf = await Professeur.findOne({ email });
    if (existingProf) {
      return res.status(400).json({ message: "Un professeur avec cet email existe déjà." });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer un nouveau professeur
    const newProf = new Professeur({
      nom,
      prenom,
      email,
      telephone,
      password: hashedPassword, // Mot de passe haché
      matiere,
      classes,
      id_recrut,
      grade,
      date_inscription,
    });

    // Sauvegarder dans la base de données
    await newProf.save();

    res.status(201).json({ message: "Professeur ajouté avec succès", professeur: newProf });
  } catch (error) {
    console.error("Erreur lors de l'ajout du professeur :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du professeur." });
  }
});

router.get("/classes", async (req, res) => {
  try {
    // Récupérer le token de l'en-tête de la requête
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer le professeur et ses classes
    const professeur = await Professeur.findById(decoded.id).populate("classes");
    if (!professeur) {
      return res.status(404).json({ message: "Professeur non trouvé." });
    }

    // Retourner les classes du professeur
    res.status(200).json(professeur.classes);
  } catch (error) {
    console.error("Erreur lors de la récupération des classes :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des classes." });
  }
});

module.exports = router;