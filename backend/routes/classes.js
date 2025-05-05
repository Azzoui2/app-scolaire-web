const express = require("express");
const Classe = require("../models/Class");
const Counter = require("../models/Counter");

const router = express.Router();

// Fonction pour obtenir le prochain numéro
const getNextClassNumber = async (level) => {
  let counter = await Counter.findOne({ level });
  if (!counter) {
    counter = await Counter.create({ level, count: 1 });
  } else {
    counter.count += 1;
    await counter.save();
  }
  return counter.count;
};

// Ajouter une classe
router.post("/", async (req, res) => {
  try {
    const { level } = req.body;
    if (!level) return res.status(400).json({ message: "Niveau requis" });

    const number = await getNextClassNumber(level);
    const newClass = new Classe({ number, level });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer toutes les classes
router.get("/", async (req, res) => {
  try {
    const classes = await Classe.find().sort({ level: 1, number: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une classe
router.delete("/:id", async (req, res) => {
  try {
    await Classe.findByIdAndDelete(req.params.id);
    res.json({ message: "Classe supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
