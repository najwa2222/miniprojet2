// API Tâches
const express = require("express");
const app = express();
const port = 3000;
const http = require('http');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const bodyParser = require("body-parser");
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static("public"));
// Securiser les API
const jwt = require('jsonwebtoken');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/tasks");
const db = mongoose.connection;
db.on("error", () => {
  console.log("Erreur");
});
db.once("open", () => {
  console.log("Connexion avec succès");
});
const Task = require("./models/task");
// Intégration de la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



const secretKey = process.env.SECRET_KEY || 'votreclésecrete'; 
// Messages constants
const ERROR_MESSAGE = 'L\'authentification a échoué';
const SUCCESS_MESSAGE = 'L\'authentification a réussi';
//Lister contact
app.use(bodyParser.json());




// Retourne les détails d'une tâche spécifique
app.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Aucune tâche trouvée avec cet ID.' });
    }
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Permet de créer une nouvelle tâche
app.post('/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ message: 'Tâche créée avec succès.', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Permet de mettre à jour les détails d'une tâche existante
app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) {
      return res.status(404).json({ message: 'Aucune tâche trouvée avec cet ID.' });
    }
    res.json({ message: 'Tâche mise à jour avec succès.', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

// Permet de supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Aucune tâche trouvée avec cet ID.' });
    }
    res.json({ message: 'Tâche supprimée avec succès.', task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

app.post('/login', (req, res) => {
  try {
  const { username, password } = req.body;

  // Validation des champs requis
  if (!username || !password) {
  throw new Error('Les champs "username" et "password" sont requis.');
  }
  // Dans un véritable cas d'utilisation, vous vérifieriez les informations d'authentification ici
 // Si l'authentification réussit, vous pouvez générer un JWT
 if (username === 'najwa' && password === '0000') {
     const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
     res.json({ token, message: SUCCESS_MESSAGE });
     } else {
     res.status(401).json({ message: ERROR_MESSAGE });
     }
     } catch (error) {
     console.error(error.message);
     res.status(500).json({ message: 'Erreur interne du serveur.' });
     }
    });

    app.use((req, res, next) => {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
      }
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Token non valide' });
        }
        req.user = decoded;
        next();
      });
    });
    app.get('/tasks', async (req, res) => {
      try {
        const tasks = await Task.find({});
        res.json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
      }
    });

    // Gérez les connexions WebSocket
io.on("connection", (socket) => {
  console.log("Nouvelle connexion WebSocket établie");
  // Écoutez les messages du client
  socket.on("chatMessage", (message) => {
    // Émettez le message à tous les clients connectés
    io.emit("chatMessage", message);
  });
});

app.listen(3000, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
