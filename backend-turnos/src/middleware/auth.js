// Middleware de autenticación
// Verifica que el request tenga un JWT válido antes de continuar

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // El token viene en el header: "Authorization: Bearer eyJ..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica y decodifica el token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Guarda los datos del usuario en req.user para usarlos en las rutas
    req.user = payload;
    next(); // continúa al siguiente paso
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = authMiddleware;
