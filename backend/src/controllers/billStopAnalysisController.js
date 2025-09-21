'use strict';

const { Customer, LastBillDate, MeterReading, MdmRead, MeterReplacement, Ticket } = require('../models');
const { Op } = require('sequelize');

const { getGeminiAnalysis } = require('../services/aiService');

const analyzeBillStopIssue = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customer = await Customer.findOne({ where: { CUSTOMER_NUM: customerId } });
    if (!customer) {
      return res.status(404).send({ message: 'Customer not found.' });
    }

    // 1. Initial Read Check
    const initialMdmRead = await MdmRead.findOne({ where: { CUSTOMER_ID: customer.CUSTOMER_NUM, MSRMT_DTTM: customer.CONN_DATE } });
    if (!initialMdmRead) {
      const initialHesRead = await MeterReading.findOne({ where: { METER_NO: customer.METER_NO, reading_date: customer.CONN_DATE } });
      const prompt = `
        You are an expert utility billing analyst. Your task is to analyze a "bill stop" issue for a customer and provide a root cause and a detailed, step-by-step resolution plan.

        **Scenario:** Initial Read Missing in MDM

        **Customer Data:**
        - Customer ID: ${customer.CUSTOMER_NUM}
        - Name: ${customer.CUSTOMER_NAME}
        - Installation Date: ${customer.CONN_DATE}

        **Analysis Data:**
        - Initial Read in MDM (on installation date): **MISSING**
        - Initial Read in HES (on installation date): ${initialHesRead ? '**PRESENT**' : '**MISSING**'}

        **Instructions:**
        1.  **Root Cause Analysis:** Based on all the data above, what is the specific root cause of this bill stop?
        2.  **Resolution Plan:** Provide a clear, numbered, step-by-step plan for a support agent to follow to resolve this issue.
      `;
      const analysis = await getGeminiAnalysis(prompt);
      return res.status(200).json(analysis);
    }

    // 2. Meter Replacement Check
    const replacement = await MeterReplacement.findOne({ where: { oldMeterNumber: customer.METER_NO } });
    if (replacement) {
      const lastBillDate = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customer.CUSTOMER_NUM } });
      if (!lastBillDate || new Date(lastBillDate.LAST_BILL_DATE) < new Date(replacement.replaceDate)) {
        const prompt = `
          You are an expert utility billing analyst. Your task is to analyze a "bill stop" issue for a customer and provide a root cause and a detailed, step-by-step resolution plan.

          **Scenario:** Meter Replacement Issue

          **Customer Data:**
          - Customer ID: ${customer.CUSTOMER_NUM}
          - Name: ${customer.CUSTOMER_NAME}

          **Meter Replacement Data:**
          - Old Meter: ${replacement.oldMeterNumber}
          - New Meter: ${replacement.newMeterNumber}
          - Replacement Date: ${replacement.replaceDate}
          - Last Bill Date for Old Meter: ${lastBillDate ? lastBillDate.LAST_BILL_DATE : 'N/A'}

          **Instructions:**
          1.  **Root Cause Analysis:** The final bill for the old meter seems to be missing. Analyze the situation and provide a specific root cause.
          2.  **Resolution Plan:** Provide a clear, numbered, step-by-step plan to resolve the billing for the old meter and ensure the new meter is billing correctly.
        `;
        const analysis = await getGeminiAnalysis(prompt);
        return res.status(200).json(analysis);
      }
    }

    // 3. Default to HES/MDM Sync Issue
    const lastBill = await LastBillDate.findOne({ where: { CUSTOMER_NUM: customer.CUSTOMER_NUM } });
    const prompt = `
      You are an expert utility billing analyst. Your task is to analyze a "bill stop" issue for a customer and provide a root cause and a detailed, step-by-step resolution plan.

      **Scenario:** Potential HES/MDM Sync Issue

      **Customer Data:**
      - Customer ID: ${customer.CUSTOMER_NUM}
      - Name: ${customer.CUSTOMER_NAME}
      - Last Bill Date: ${lastBill ? lastBill.LAST_BILL_DATE : 'N/A'}

      **Instructions:**
      1.  **Root Cause Analysis:** The customer is not billed up to the current month. Analyze the situation and provide a specific root cause. You may need to check for missing reads in MDM compared to HES.
      2.  **Resolution Plan:** Provide a clear, numbered, step-by-step plan to resolve this billing issue.
    `;
    const analysis = await getGeminiAnalysis(prompt);
    res.status(200).json(analysis);

  } catch (error) {
    console.error('Error analyzing bill stop issue:', error);
    res.status(500).send({ message: 'Error analyzing bill stop issue.', error: error.message });
  }
};

module.exports = {
  analyzeBillStopIssue
};
