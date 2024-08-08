require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Obtener la URI de MongoDB desde las variables de entorno
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI no está definida en el archivo .env');
  process.exit(1); // Salir del proceso con error si la URI no está definida
}

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let collection;
let pedidosCollection;
let usuariosCollection;

// Conectar a la base de datos y establecer la colección una vez
async function connectToDatabase() {
  try {
    await client.connect();
    const database = client.db('guido');
    pedidosCollection = database.collection('Pedidos');
    usuariosCollection = database.collection('Usuarios');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

///////////////// GET OBTENER COSAS

app.get('/pedidos', async (req, res) => {
  try {
    console.log("FUNCA");
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/pedidos', async (req, res) => {
  try {
    const documents = await pedidosCollection.find().toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.get('/login/:usuario:password', async (req, res) => {
  try {
    const documents = await usuariosCollection.find().toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

///////////////////////// POST CREAR COSAS
app.post('/nuevopedido', async (req, res) => {
  try {
    const nuevoPedido = req.body;
    const resultado = await pedidosCollection.insertOne(nuevoPedido);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al insertar nuevo pedido:', error);
    res.status(500).json({ error: 'Error al insertar nuevo pedido' });
  }
});

////////////////////// PUT
app.put('/pedidos/:id', async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const actualizacion = req.body;
    const objectId = new ObjectId(pedidoId);
    const resultado = await pedidosCollection.updateOne(
      { _id: objectId },
      { $set: actualizacion }
    );

    if (resultado.matchedCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ message: 'Pedido actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

//////////////////////////
// Endpoint de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await usuariosCollection.findOne({ Usuario: username });
    if (user) {
      const match = await bcrypt.compare(password, user.Password);
      if (match) {
        res.status(200).json({ message: 'Login exitoso' });
      } else {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      }
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

///////////////////////// LISTEN

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});