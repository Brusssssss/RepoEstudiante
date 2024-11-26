const jsonServer = require("json-server");
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
  const existe = db.registroclase.some((registro) => 
    registro.rut === nuevaAsistencia.rut &&
    registro.ramo === nuevaAsistencia.ramo &&
    registro.fecha === nuevaAsistencia.fecha
  );

  if (existe) {
    return res.status(400).json({ message: "Ya registraste tu asistencia para esta asignatura hoy." });
  }

  // Si no existe, continúa con la operación normal de json-server
  next();
});
// Ruta para obtener el contenido del archivo JSON
app.get('/registroclase', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./usuarios.json', 'utf8'));
  res.json(data.registroclase);
});
// Ruta para agregar un nuevo registro de asistencia
app.post('/registroclase', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./usuarios.json', 'utf8'));
  const nuevaAsistencia = req.body;

  // Verificar si ya existe un registro con el mismo rut, ramo y fecha
  const existe = data.registroclase.some(registro =>
    registro.rut === nuevaAsistencia.rut &&
    registro.ramo === nuevaAsistencia.ramo &&
    registro.fecha === nuevaAsistencia.fecha
  );

  if (existe) {
    return res.status(400).json({ message: "Ya registraste tu asistencia para esta asignatura hoy." });
  }

  data.registroclase.push(nuevaAsistencia);
  fs.writeFileSync('./usuarios.json', JSON.stringify(data, null, 2));
  res.status(201).json(nuevaAsistencia);
});
server.use(jsonServer.bodyParser);
server.post('/asisregister', (req, res, next) => {
  const { rut, ramo, fecha } = req.body;
  const db = router.db; // Acceso a la base de datos
  const asistencias = db.get('asisregister').value();

  const duplicado = asistencias.some((a) => a.rut === rut && a.ramo === ramo && a.fecha === fecha);
  if (duplicado) {
    return res.status(400).json({ message: "Ya has registrado asistencia para esta clase hoy." });
  }
  
  next(); // Continúa con el registro si no hay duplicados
});
server.use(router);

server.listen(port);


