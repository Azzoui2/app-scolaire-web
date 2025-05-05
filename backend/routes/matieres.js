const express = require("express");
const router = express.Router();
const Matiere = require("../models/Matiere");

// ✅ Obtenir toutes les matières
router.get("/", async (req, res) => {
  try {
    const matieres = await Matiere.find();
    res.json(matieres);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ✅ Ajouter une matière
router.post("/", async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ message: "Le nom est requis" });

    const newMatiere = new Matiere({ nom });
    await newMatiere.save();
    res.status(201).json({ message: "Matière ajoutée", matiere: newMatiere });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// ✅ Supprimer une matière
router.delete("/:id", async (req, res) => {
  try {
    await Matiere.findByIdAndDelete(req.params.id);
    res.json({ message: "Matière supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
