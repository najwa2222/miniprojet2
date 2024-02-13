
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['En cours', 'Terminée', 'En attente'], default: 'En attente' },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
