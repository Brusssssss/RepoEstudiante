const jsonServer = require("json-server");
const fs = require("fs"); // Asegúrate de importar fs
const server = jsonServer.create();
const router = jsonServer.router("usuarios.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

server.use(middlewares);
server.use(jsonServer.bodyParser); // Necesario para procesar el body en JSON

// Middleware para manejar validaciones en el registro de asistencia
server.post("/registroclase", (req, res, next) => {
  const db = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
  const nuevaAsistencia = req.body;

  // Validar si ya existe una asistencia con el mismo rut, ramo y fecha
  const existe = db.registroclase.some(
    (registro) =>
      registro.profesor === nuevaAsistencia.profesor &&
      registro.ramo === nuevaAsistencia.ramo &&
      registro.fecha === nuevaAsistencia.fecha
  );

  if (existe) {
    return res
      .status(400)
      .json({ message: "Ya registraste tu asistencia para esta asignatura hoy." });
  }

  // Si no existe, continúa con la operación normal de json-server
  db.registroclase.push(nuevaAsistencia);
  fs.writeFileSync("usuarios.json", JSON.stringify(db, null, 2));
  res.status(201).json(nuevaAsistencia);
});

// Ruta para obtener el contenido del archivo JSON
server.get("/registroclase", (req, res) => {
  const data = JSON.parse(fs.readFileSync("./usuarios.json", "utf8"));
  res.json(data.registroclase);
});

// Ruta para registrar asistencia
server.post("/asisregister", (req, res) => {
  const db = router.db; // Acceso a la base de datos JSON de json-server
  const nuevaAsistencia = req.body;

  // Validar que los datos necesarios estén presentes
  if (!nuevaAsistencia.ramo || !nuevaAsistencia.fecha || !nuevaAsistencia.email) {
    return res
      .status(400)
      .json({ message: "Faltan datos obligatorios (ramo, fecha o email)." });
  }

  // Verificar si ya existe un registro duplicado en asisregister
  const duplicado = db.get("asisregister").find(
    (registro) =>
      registro.ramo === nuevaAsistencia.ramo &&
      registro.fecha === nuevaAsistencia.fecha &&
      registro.email === nuevaAsistencia.email
  ).value();

  if (duplicado) {
    return res
      .status(400)
      .json({ message: "Ya registraste tu asistencia para esta asignatura hoy." });
  }

  // Buscar la clase relacionada en registroclase
  const claseRelacionada = db.get("registroclase").find({ ramo: nuevaAsistencia.ramo }).value();

  if (!claseRelacionada) {
    return res
      .status(404)
      .json({ message: "No se encontró la clase relacionada en registroclase." });
  }

  // Construir el nuevo registro con datos de registroclase y lo recibido en el body
  const nuevoRegistro = {
    ...claseRelacionada,
    fecha: nuevaAsistencia.fecha, // Sobrescribir con la fecha proporcionada
    email: nuevaAsistencia.email, // Agregar el email
  };

  // Agregar el nuevo registro a asisregister
  db.get("asisregister").push(nuevoRegistro).write(); // Actualizar el archivo JSON

  res.status(201).json(nuevoRegistro); // Devolver el registro creado
});
// Ruta para actualizar un usuario
server.put("/usuarios/:id", (req, res) => {
  const db = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
  const { id } = req.params;
  const updatedUser = req.body;

  // Buscar al usuario en el arreglo
  const index = db.usuarios.findIndex(user => user.id === parseInt(id));
  if (index !== -1) {
    db.usuarios[index] = { ...db.usuarios[index], ...updatedUser };
    fs.writeFileSync("usuarios.json", JSON.stringify(db, null, 2));
    res.status(200).json(db.usuarios[index]);
  } else {
    res.status(404).json({ message: "Usuario no encontrado" });
  }
});


// Usar el router de json-server
server.use(router);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});


