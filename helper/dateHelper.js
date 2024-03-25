function getWeeksOfMonth(year, month) {
  let weeks = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  let currentWeek = [];
  let currentDate = new Date(firstDayOfMonth); // Create a new Date object to avoid modifying the original date
  
  while (currentDate <= lastDayOfMonth) {
    currentWeek.push(formatDate(currentDate)); // Push the formatted date string into the current week
    
    if (currentDate.getDay() === 6 || currentDate.getDate() === lastDayOfMonth.getDate()) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  weeks = weeks.flat()
  let finalDates = []
  for (let i = 0; i < weeks.length; i++) {
    if (i % 6 === 0 || i === 0 || i === weeks.length) {
        finalDates.push(new Date(weeks[i]))
    }
  }


  return finalDates
}

function formatDate(date) { 
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

// Example usage
const currentYear = 2024;
const currentMonth = 2; // March (0-indexed)


  
 
  
  
  
  module.exports = {
    getWeeksOfMonth
  };
  