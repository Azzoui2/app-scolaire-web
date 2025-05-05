const mongoose = require("mongoose");

const professeurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  password: { type: String, required: true },
  matiere: { type: mongoose.Schema.Types.ObjectId, ref: "Matiere" },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classe" }],
  id_recrut: { type: String, required: true },
  grade: { type: String, required: true },
  date_inscription: { type: Date, required: true },
  hasChangedPassword: { type: Boolean, default: false }, // Nouveau champ
});

module.exports = mongoose.model("Professeur", professeurSchema);