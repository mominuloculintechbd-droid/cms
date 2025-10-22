const Papa = require('papaparse');

class CSVParserService {
    /**
     * Parse CSV/text file and extract meter readings
     * Handles format: METERNO, UOM, readdttm, read
     * @param {Buffer} fileBuffer - CSV file buffer
     * @returns {Promise<Object>} Parsed data with meter info and readings
     */
    async parseMeterReadings(fileBuffer) {
        try {
            const fileContent = fileBuffer.toString('utf-8');

            // Parse CSV
            const parseResult = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
                transform: (value) => value.trim()
            });

            if (parseResult.errors.length > 0) {
                console.error('CSV parsing errors:', parseResult.errors);
            }

            const rows = parseResult.data;

            if (rows.length === 0) {
                throw new Error('No data found in file');
            }

            // Extract meter number from first row
            const meterNo = rows[0].METERNO;
            if (!meterNo) {
                throw new Error('Meter number (METERNO) not found in file');
            }

            console.log(`📊 Found meter: ${meterNo}, processing ${rows.length} rows`);

            // Process readings
            const readings = [];
            let skippedNullReadings = 0;

            for (const row of rows) {
                // Skip rows with null or empty read values
                if (!row.read || row.read === 'null' || row.read.trim() === '') {
                    skippedNullReadings++;
                    console.log(`⚠️  Skipped null reading for date: ${row.readdttm}`);
                    continue;
                }

                // Parse date (handles M/D/YYYY format)
                const readingDate = this.parseDate(row.readdttm);
                if (!readingDate) {
                    console.log(`⚠️  Skipped invalid date: ${row.readdttm}`);
                    continue;
                }

                // Parse read value
                const readValue = parseFloat(row.read);
                if (isNaN(readValue)) {
                    console.log(`⚠️  Skipped invalid read value: ${row.read}`);
                    continue;
                }

                readings.push({
                    reading_date: readingDate,
                    total_energy: readValue,
                    // For CSV format, we only have total energy
                    // TOD1 and TOD2 will be null
                    tod1_energy: null,
                    tod2_energy: null
                });
            }

            if (readings.length === 0) {
                throw new Error(`No valid readings found. All ${skippedNullReadings} readings had null values.`);
            }

            console.log(`✅ Successfully parsed ${readings.length} valid readings (skipped ${skippedNullReadings} null readings)`);

            return {
                meterNo,
                readings,
                totalReadings: readings.length,
                skippedNullReadings
            };

        } catch (error) {
            console.error('Error parsing CSV:', error);
            throw error;
        }
    }

    /**
     * Parse date from CSV format (M/D/YYYY or MM/DD/YYYY) to database format (YYYY-MM-DD)
     * @param {string} dateString - Date string from CSV
     * @returns {string|null} Date in YYYY-MM-DD format or null if invalid
     */
    parseDate(dateString) {
        try {
            if (!dateString || dateString === 'null') {
                return null;
            }

            const parts = dateString.trim().split('/');
            if (parts.length !== 3) {
                return null;
            }

            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];

            // Validate date components
            const monthNum = parseInt(month);
            const dayNum = parseInt(day);
            const yearNum = parseInt(year);

            if (monthNum < 1 || monthNum > 12) {
                return null;
            }

            if (dayNum < 1 || dayNum > 31) {
                return null;
            }

            if (yearNum < 1900 || yearNum > 2100) {
                return null;
            }

            return `${year}-${month}-${day}`;

        } catch (error) {
            console.error(`Error parsing date "${dateString}":`, error);
            return null;
        }
    }

    /**
     * Detect if buffer is CSV format
     * @param {Buffer} buffer - File buffer
     * @returns {boolean} True if appears to be CSV
     */
    isCSVFormat(buffer) {
        try {
            const content = buffer.toString('utf-8', 0, 500); // Check first 500 bytes

            // Check for common CSV indicators
            const hasComma = content.includes(',');
            const hasTab = content.includes('\t');
            const hasNewline = content.includes('\n');

            // Check for expected column headers
            const hasExpectedHeaders =
                content.includes('METERNO') ||
                content.includes('readdttm') ||
                content.includes('read');

            return (hasComma || hasTab) && hasNewline && hasExpectedHeaders;

        } catch (error) {
            return false;
        }
    }
}

module.exports = new CSVParserService();
