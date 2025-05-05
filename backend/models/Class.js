const mongoose = require("mongoose");

const ClasseSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  level: { type: String, required: true, enum: ["1er collège", "2e collège", "3e collège"] },
});

module.exports = mongoose.model("Classe", ClasseSchema);


