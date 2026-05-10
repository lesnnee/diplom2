import User from "../models/User.js";

// 🧠 Функция расчёта score (работает с обоими полями)
export function calculateScore(user) {
  // Поддерживает и activeTickets, и assignedTickets.length
  const activeCount = user.activeTickets || user.assignedTickets?.length || 0;
  
  return (
    (user.successRate || 0) * 0.5 +
    (1 / (activeCount + 1)) * 0.3 +
    (1 / ((user.avgResolutionTime || 0) + 1)) * 0.2
  );
}

// 🧠 Выбор специалиста: наименьшая нагрузка → лучший score
export async function findBestSpecialist(role) {
  const users = await User.find({ role, isActive: true });

  if (users.length === 0) {
    return null;
  }

  // 1. Подсчитываем нагрузку для каждого
  const usersWithLoad = users.map(user => ({
    user,
    load: user.activeTickets || user.assignedTickets?.length || 0
  }));

  // 2. Находим минимальную нагрузку
  const minLoad = Math.min(...usersWithLoad.map(u => u.load));

  // 3. Фильтруем тех, у кого минимальная нагрузка
  const leastLoaded = usersWithLoad.filter(u => u.load === minLoad).map(u => u.user);

  // 4. Если один - возвращаем его
  if (leastLoaded.length === 1) {
    return leastLoaded[0];
  }

  // 5. Если несколько - выбираем лучшего по score
  leastLoaded.sort((a, b) => calculateScore(b) - calculateScore(a));
  
  return leastLoaded[0];
}