const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  level: { type: String, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", CounterSchema);
