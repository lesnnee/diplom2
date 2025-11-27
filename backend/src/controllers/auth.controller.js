import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Регистрация
export const register = async (req, res) => {
  try {
    const { name, email, password, role, company, phone } = req.body;

    // Проверка, есть ли уже пользователь с таким email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      company,
      phone
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Вход
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
