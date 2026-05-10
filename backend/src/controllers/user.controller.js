import User from "../models/User.js";

// =======================================================
// GET USERS BY ROLE
// =======================================================
export const getUsersByRole = async (req, res) => {
  try {
    const { role, isActive } = req.query;
    
    const filter = { role };
    if (isActive === 'true') filter.isActive = true;
    
    const users = await User.find(filter)
      .select("name email role activeTickets assignedTickets")
      .sort({ activeTickets: 1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================================================
// GET ALL SPECIALISTS (все специалисты, без фильтра isActive)
// =======================================================
export const getSpecialists = async (req, res) => {
  try {
    // Роли специалистов (все, кроме admin, user, operator)
    const specialistRoles = [
      "it_support",
      "network_admin", 
      "sysadmin",
      "security",
      "hardware_support"
    ];
    
    const filter = { role: { $in: specialistRoles } };
    
    // ❌ НЕТ фильтра по isActive — подгружаем ВСЕХ!
    
    const specialists = await User.find(filter)
      .select("name email role activeTickets assignedTickets")
      .sort({ role: 1, activeTickets: 1 });
    
    console.log(`✅ Found ${specialists.length} specialists (all, regardless of active status)`);
    res.json(specialists);
    
  } catch (err) {
    console.error("❌ Error in getSpecialists:", err);
    res.status(500).json({ error: err.message });
  }
};