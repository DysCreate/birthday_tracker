const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Presentational only: derives "days left", "is today", the next date and the age being turned. */
export const getTurnInfo = (birthDate) => {
  const today = startOfToday();
  const thisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const next = thisYear < today
    ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
    : thisYear;

  const daysLeft = Math.round((next - today) / 86400000);
  const age = next.getFullYear() - birthDate.getFullYear();

  return {
    daysLeft,
    isToday: daysLeft === 0,
    next,
    age: Number.isFinite(age) && age > 0 && age < 130 ? age : null,
  };
};
