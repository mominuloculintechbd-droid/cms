/**
 * Estimation Service
 * Provides methods for estimating missing meter readings using:
 * 1. Linear Interpolation (when readings exist on both sides)
 * 2. Backward Accumulation (when only reading after exists)
 */

/**
 * Get the number of months between two dates
 */
function getMonthsBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
}

/**
 * Get month position relative to a reference date
 */
function getMonthPosition(date, referenceDate) {
  return getMonthsBetween(referenceDate, date);
}

/**
 * Find the last reading before a target month
 */
function findLastReadingBefore(readings, targetMonth) {
  const targetDate = new Date(targetMonth);
  return readings
    .filter(r => new Date(r.reading_date) < targetDate)
    .sort((a, b) => new Date(b.reading_date) - new Date(a.reading_date))[0];
}

/**
 * Find the first reading after a target month
 */
function findFirstReadingAfter(readings, targetMonth) {
  const targetDate = new Date(targetMonth);
  // Create end of target month for comparison
  const endOfTargetMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

  return readings
    .filter(r => new Date(r.reading_date) > endOfTargetMonth)
    .sort((a, b) => new Date(a.reading_date) - new Date(b.reading_date))[0];
}

/**
 * Linear Interpolation
 * Used when readings exist on both sides of missing period
 */
function linearInterpolation(beforeReading, afterReading, targetMonthKey, referenceDate) {
  // Parse the target month key (format: "YYYY-M")
  const [year, month] = targetMonthKey.split('-').map(Number);
  const targetDate = new Date(year, month, 1); // Use 1st of month

  const x1 = getMonthPosition(beforeReading.reading_date, referenceDate);
  const x2 = getMonthPosition(afterReading.reading_date, referenceDate);
  const x = getMonthPosition(targetDate, referenceDate);

  const y1 = beforeReading.value_kwh;
  const y2 = afterReading.value_kwh;

  const estimatedValue = y1 + (y2 - y1) * (x - x1) / (x2 - x1);

  return {
    month: targetMonthKey,
    estimated_kwh: Math.round(estimatedValue * 100) / 100, // Round to 2 decimals
    method: 'Linear Interpolation',
    confidence: 'HIGH',
    details: {
      before: {
        date: beforeReading.reading_date,
        value: y1
      },
      after: {
        date: afterReading.reading_date,
        value: y2
      },
      slope: Math.round(((y2 - y1) / (x2 - x1)) * 100) / 100
    }
  };
}

/**
 * Backward Accumulation
 * Used when only reading AFTER missing period exists
 * Distributes total consumption backwards across all missing months
 */
function backwardAccumulation(afterReading, targetMonthKey, lastBillDate) {
  // Calculate start date (month after last bill date)
  const startDate = new Date(lastBillDate);
  startDate.setMonth(startDate.getMonth() + 1);
  startDate.setDate(1); // First day of month

  const endDate = new Date(afterReading.reading_date);

  // Calculate total months from start to first reading
  const totalMonths = getMonthsBetween(startDate, endDate) + 1; // Include end month

  // Calculate monthly rate
  const monthlyRate = afterReading.value_kwh / totalMonths;

  // Parse target month key
  const [year, month] = targetMonthKey.split('-').map(Number);
  const targetDate = new Date(year, month, 1);

  // Calculate position of target month (1-based)
  const monthPosition = getMonthsBetween(startDate, targetDate) + 1;

  // Calculate cumulative value (sum of all months up to and including target month)
  const cumulativeValue = monthlyRate * monthPosition;

  return {
    month: targetMonthKey,
    estimated_kwh: Math.round(cumulativeValue * 100) / 100, // Round to 2 decimals
    method: 'Backward Accumulation',
    confidence: 'MEDIUM',
    details: {
      first_reading: {
        date: afterReading.reading_date,
        value: afterReading.value_kwh
      },
      total_months: totalMonths,
      monthly_rate: Math.round(monthlyRate * 100) / 100,
      position: monthPosition,
      calculation: `${Math.round(monthlyRate * 100) / 100} × ${monthPosition} = ${Math.round(cumulativeValue * 100) / 100}`
    }
  };
}

/**
 * Main function to estimate missing months
 * @param {Array} readings - All available readings for the meter
 * @param {Array} missingMonthKeys - Array of missing month keys (format: "YYYY-M")
 * @param {Date} lastBillDate - Last bill date for the customer
 * @returns {Array} - Array of estimation objects
 */
function estimateMissingMonths(readings, missingMonthKeys, lastBillDate) {
  const estimates = [];

  // Use last bill date as reference for position calculations
  const referenceDate = new Date(lastBillDate);
  referenceDate.setDate(1);

  for (const monthKey of missingMonthKeys) {
    // Parse month key to create a date
    const [year, month] = monthKey.split('-').map(Number);
    const targetDate = new Date(year, month, 1); // Use 1st of month

    const beforeReading = findLastReadingBefore(readings, targetDate);
    const afterReading = findFirstReadingAfter(readings, targetDate);

    let estimate = null;

    // SCENARIO 1: Readings on BOTH sides → Linear Interpolation
    if (beforeReading && afterReading) {
      estimate = linearInterpolation(beforeReading, afterReading, monthKey, referenceDate);
    }
    // SCENARIO 2: Only reading AFTER → Backward Accumulation
    else if (!beforeReading && afterReading) {
      estimate = backwardAccumulation(afterReading, monthKey, lastBillDate);
    }
    // If we don't have enough data, skip this month

    if (estimate) {
      estimates.push(estimate);
    }
  }

  return estimates;
}

module.exports = {
  estimateMissingMonths,
  linearInterpolation,
  backwardAccumulation,
  getMonthsBetween,
};
