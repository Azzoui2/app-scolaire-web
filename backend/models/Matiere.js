const mongoose = require("mongoose");

const matiereSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Matiere", matiereSchema);
