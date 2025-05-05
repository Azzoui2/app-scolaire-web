const mongoose = require("mongoose");

const EleveSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
 // classe: { type: mongoose.Schema.Types.ObjectId, ref: "Classe", required: true },
  classe: { type: String, required: true },  

});

module.exports = mongoose.model("Eleve", EleveSchema);
