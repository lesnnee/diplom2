import jwt from "jsonwebtoken";

// Проверка токена
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // содержит userId и role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Проверка роли (можно передавать массив допустимых ролей)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient rights" });
    }
    next();
  };
};