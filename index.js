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
  const db = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
  const nuevaAsistencia = req.body;

  // Validar que los datos necesarios estén presentes
  if (!nuevaAsistencia.ramo || !nuevaAsistencia.fecha || !nuevaAsistencia.email) {
    return res
      .status(400)
      .json({ message: "Faltan datos obligatorios (ramo, fecha o email)." });
  }

  // Verificar si ya existe un registro duplicado en asisregister
  const duplicado = db.asisregister.some(
    (registro) =>
      registro.ramo === nuevaAsistencia.ramo &&
      registro.fecha === nuevaAsistencia.fecha &&
      registro.email === nuevaAsistencia.email
  );

  if (duplicado) {
    return res
      .status(400)
      .json({ message: "Ya registraste tu asistencia para esta asignatura hoy." });
  }

  // Tomar datos desde registroclase relacionados con el ramo
  const claseRelacionada = db.registroclase.find(
    (clase) => clase.ramo === nuevaAsistencia.ramo
  );

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

  // Guardar el nuevo registro en asisregister
  db.asisregister.push(nuevoRegistro);
  fs.writeFileSync("usuarios.json", JSON.stringify(db, null, 2)); // Guardar cambios

  res.status(201).json(nuevoRegistro); // Devolver el registro creado
});
// Usar el router de json-server
server.use(router);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});


