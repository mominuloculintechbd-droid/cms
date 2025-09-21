'use strict';

const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getGeminiAnalysis = async (prompt) => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in the environment variables.');
  }

  try {
    const response = await axios.post(API_URL, {
      model: 'llama-3.1-8b-instant', // Use Llama 3.1 8B model on Groq
      messages: [
        {
          role: 'system',
          content: `
            You are an expert utility billing analyst. Your task is to analyze a "bill stop" issue and provide a clear Root Cause and a numbered Resolution Plan.

            Here is an example of a perfect analysis:
            ---
            **User's Data:**
            - Scenario: Initial Read Missing in MDM
            - Initial Read in HES: PRESENT

            **Your Response:**
            **Root Cause:** The initial meter read on the installation date is missing from the MDM system, but it is available in the HES system. This is a data synchronization issue.
            **Resolution Plan:**
            1. Verify the initial read in the HES system.
            2. Manually trigger a data transfer from HES to MDM for the initial read.
            3. Confirm that the read now appears in the MDM system.
            4. Regenerate the bill for the customer.
            ---

            Now, please perform the analysis for the following case.
          `
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const generatedText = response.data.choices[0].message.content;

    // More flexible parsing logic
    let rootCause = 'Could not determine root cause.';
    let resolutionPlan = 'Could not determine resolution plan.';

    const rootCauseIndex = generatedText.toLowerCase().indexOf('root cause');
    const resolutionPlanIndex = generatedText.toLowerCase().indexOf('resolution plan');

    if (rootCauseIndex !== -1) {
      if (resolutionPlanIndex !== -1) {
        rootCause = generatedText.substring(rootCauseIndex + 10, resolutionPlanIndex).trim();
      } else {
        rootCause = generatedText.substring(rootCauseIndex + 10).trim();
      }
    }

    if (resolutionPlanIndex !== -1) {
      resolutionPlan = generatedText.substring(resolutionPlanIndex + 15).trim();
    }

    return {
      rootCause,
      resolutionPlan
    };

  } catch (error) {
    console.error('Error calling Groq API:', error.response ? error.response.data : error.message);
    throw new Error('Failed to get analysis from Groq API.');
  }
};

module.exports = {
  getGeminiAnalysis
};
