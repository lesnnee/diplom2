import User from "../models/User.js";

// 🧠 score функции
export function calculateScore(user) {
  return (
    user.successRate * 0.5 +
    (1 / (user.activeTickets + 1)) * 0.3 +
    (1 / (user.avgResolutionTime + 1)) * 0.2
  );
}

// 🧠 выбор лучшего специалиста
export async function findBestSpecialist(role) {
  const users = await User.find({ role });

  let best = null;
  let bestScore = -1;

  for (const user of users) {
    const score = calculateScore(user);

    if (score > bestScore) {
      bestScore = score;
      best = user;
    }
  }

  return best;
}