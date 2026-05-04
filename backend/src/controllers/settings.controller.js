import Settings from "../models/Settings.js";


// ======================
// GET SETTINGS
// ======================
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// ROLES
// ======================
export const addRole = async (req, res) => {
  try {
    const { role } = req.body;

    const settings = await Settings.findOne();

    if (!settings.roles.includes(role)) {
      settings.roles.push(role);
      await settings.save();
    }

    res.json(settings.roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { role } = req.params;

    const settings = await Settings.findOne();

    settings.roles = settings.roles.filter((r) => r !== role);

    await settings.save();

    res.json(settings.roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// CATEGORIES
// ======================
export const addCategory = async (req, res) => {
  try {
    const { category } = req.body;

    const settings = await Settings.findOne();

    if (!settings.categories.includes(category)) {
      settings.categories.push(category);
      await settings.save();
    }

    res.json(settings.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const settings = await Settings.findOne();

    settings.categories = settings.categories.filter(
      (c) => c !== category
    );

    await settings.save();

    res.json(settings.categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ======================
// PRIORITIES
// ======================
export const addPriority = async (req, res) => {
  try {
    const { priority } = req.body;

    const p = Number(priority);

    const settings = await Settings.findOne();

    if (!settings.priorities.includes(p)) {
      settings.priorities.push(p);
      settings.priorities.sort((a, b) => a - b);
      await settings.save();
    }

    res.json(settings.priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePriority = async (req, res) => {
  try {
    const priority = Number(req.params.priority);

    const settings = await Settings.findOne();

    settings.priorities = settings.priorities.filter(
      (p) => p !== priority
    );

    await settings.save();

    res.json(settings.priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};