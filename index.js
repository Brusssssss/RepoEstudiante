const jsonServer = require("json-server");
const fs = require("fs"); // Asegúrate de importar fs
const server = jsonServer.create();
const router = jsonServer.router("usuarios.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 10000;

server.use(middlewares);

// Middleware para manejar validaciones en el registro de asistencia
server.post("/registroclase", (req, res, next) => {
  const db = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
  const nuevaAsistencia = req.body;

  // Validar si ya existe una asistencia con el mismo rut, ramo y fecha
  const existe = db.registroclase.some(
    (registro) =>
      registro.rut === nuevaAsistencia.rut &&
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

// Ruta para agregar un nuevo registro de asistencia
server.post("/asisregister", (req, res) => {
  const db = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
  const nuevaAsistencia = req.body;

  // Verificar si ya existe un registro con el mismo rut, ramo y fecha
  const duplicado = db.asisregister.some(
    (registro) =>
      registro.rut === nuevaAsistencia.rut &&
      registro.ramo === nuevaAsistencia.ramo &&
      registro.fecha === nuevaAsistencia.fecha
  );

  if (duplicado) {
    return res
      .status(400)
      .json({ message: "Ya registraste tu asistencia para esta asignatura hoy." });
  }

  // Agregar la nueva asistencia al arreglo
  db.asisregister.push(nuevaAsistencia);
  fs.writeFileSync("usuarios.json", JSON.stringify(db, null, 2));

  res.status(201).json(nuevaAsistencia);
});

// Usar el router de json-server
server.use(router);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});


