class PDFParserService {
    /**
     * Parse billing profile PDF and extract meter readings
     * @param {Buffer} pdfBuffer - PDF file buffer
     * @returns {Promise<Object>} Parsed data with meter info and readings
     */
    async parseBillingProfile(pdfBuffer) {
        try {
            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({ data: pdfBuffer });
            const pdfData = await parser.getText();
            const text = pdfData.text;

            // Extract meter number
            const meterMatch = text.match(/Meter #\s+(\d+)/);
            if (!meterMatch) {
                throw new Error('Meter number not found in PDF');
            }
            const meterNo = meterMatch[1];

            // Extract all billing dates and readings
            const billingDateMatches = [...text.matchAll(/Billing Date\s+(\d{2}\/\d{2}\/\d{4})/g)];
            const energyMatches = [...text.matchAll(/Total active forwarded energy reg \(Q1\+Q2\+Q3\+Q4\)\s+([\d\.]+) KWh/g)];
            const tod1Matches = [...text.matchAll(/Total tod 1 active forwarded energy reg\.\(reg\.1\)\s+\(Q1\+Q2\+Q3\+Q4\)\s+([\d\.]+) KWh/g)];
            const tod2Matches = [...text.matchAll(/Total tod 2 active forwarded energy reg\.\(reg\.2\)\s+\(Q1\+Q2\+Q3\+Q4\)\s+([\d\.]+) KWh/g)];

            const readings = [];

            billingDateMatches.forEach((dateMatch, index) => {
                const energyMatch = energyMatches[index];
                const tod1Match = tod1Matches[index];
                const tod2Match = tod2Matches[index];

                if (energyMatch && tod1Match && tod2Match) {
                    const dateParts = dateMatch[1].split('/'); // MM/DD/YYYY
                    const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // YYYY-MM-DD

                    readings.push({
                        reading_date: formattedDate,
                        total_energy: parseFloat(energyMatch[1]),
                        tod1_energy: parseFloat(tod1Match[1]),
                        tod2_energy: parseFloat(tod2Match[1])
                    });
                }
            });

            if (readings.length === 0) {
                throw new Error('No readings found in PDF');
            }

            return {
                meterNo,
                readings,
                totalReadings: readings.length
            };

        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw error;
        }
    }

    /**
     * Format date from PDF (MM/DD/YYYY) to database format (YYYY-MM-DD)
     * @param {string} dateString - Date in MM/DD/YYYY format
     * @returns {string} Date in YYYY-MM-DD format
     */
    formatDate(dateString) {
        const dateParts = dateString.split('/');
        return `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
    }
}

module.exports = new PDFParserService();