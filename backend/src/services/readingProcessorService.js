const MeterReading = require('../models/MeterReading');
const { Op } = require('sequelize');

class ReadingProcessorService {
    /**
     * Check which readings are new and save them to database
     * @param {string} meterNo - Meter number
     * @param {Array} readings - Array of readings from PDF
     * @returns {Promise<Object>} Summary of saved readings
     */
    async processAndSaveReadings(meterNo, readings) {
        try {
            // Get existing readings from database for this meter
            const existingReadings = await MeterReading.findAll({
                where: {
                    meter_no: meterNo
                },
                attributes: ['reading_date', 'TOTAL_ENERGY', 'TOD1_ENERGY', 'TOD2_ENERGY']
            });

            // Create a Set of existing reading dates for quick lookup
            const existingDates = new Set(
                existingReadings.map(r => {
                    const date = new Date(r.reading_date);
                    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
                })
            );

            // Filter out readings that already exist
            const newReadings = readings.filter(reading => {
                const readingDate = new Date(reading.reading_date).toISOString().split('T')[0];
                return !existingDates.has(readingDate);
            });

            const duplicateReadings = readings.filter(reading => {
                const readingDate = new Date(reading.reading_date).toISOString().split('T')[0];
                return existingDates.has(readingDate);
            });

            // Save new readings to database
            const savedReadings = [];
            if (newReadings.length > 0) {
                for (const reading of newReadings) {
                    const saved = await MeterReading.create({
                        meter_no: meterNo,
                        reading_date: reading.reading_date,
                        value_kwh: reading.total_energy, // Also save to value_kwh for consistency
                        TOTAL_ENERGY: reading.total_energy,
                        TOD1_ENERGY: reading.tod1_energy,
                        TOD2_ENERGY: reading.tod2_energy
                    });
                    savedReadings.push({
                        date: reading.reading_date,
                        total_energy: reading.total_energy,
                        tod1_energy: reading.tod1_energy,
                        tod2_energy: reading.tod2_energy
                    });
                }
            }

            return {
                meterNo,
                totalExtracted: readings.length,
                newSaved: newReadings.length,
                duplicatesSkipped: duplicateReadings.length,
                savedReadings,
                duplicateDates: duplicateReadings.map(r => r.reading_date)
            };

        } catch (error) {
            console.error('Error processing readings:', error);
            throw error;
        }
    }

    /**
     * Get summary statistics for saved readings
     * @param {Array} savedReadings - Array of saved readings
     * @returns {Object} Statistics summary
     */
    getReadingsSummary(savedReadings) {
        if (savedReadings.length === 0) {
            return null;
        }

        const totalEnergies = savedReadings.map(r => r.total_energy);
        const minEnergy = Math.min(...totalEnergies);
        const maxEnergy = Math.max(...totalEnergies);
        const avgEnergy = totalEnergies.reduce((a, b) => a + b, 0) / totalEnergies.length;

        // Get date range
        const dates = savedReadings.map(r => new Date(r.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        return {
            count: savedReadings.length,
            energyRange: {
                min: minEnergy.toFixed(2),
                max: maxEnergy.toFixed(2),
                avg: avgEnergy.toFixed(2)
            },
            dateRange: {
                from: minDate.toLocaleDateString(),
                to: maxDate.toLocaleDateString()
            }
        };
    }
}

module.exports = new ReadingProcessorService();
