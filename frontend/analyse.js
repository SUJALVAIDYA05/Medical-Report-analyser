// --- Import necessary libraries ---
import { GoogleGenerativeAI } from '@google/generative-ai';
import { promises as fs } from 'fs'; // Node.js File System
import 'dotenv/config'; // Loads your .env file

// --- Configuration ---
// 1. Set the path to your JSON file
const jsonFilePath = 'C:/Users/admin/OneDrive/Desktop/mini_project/backend/result.json';

// 2. Configure the AI (this connects to me)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Reads a JSON file, extracts the text, and sends it to the Gemini AI.
 */
async function analyzeLabReport() {
    let reportText;

    // --- 1. Read and Parse the JSON file ---
    try {
        const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Get the list of text lines
        const linesList = data.extracted_text;
        
        // Join the lines back into a single block of text
        reportText = linesList.join('\n');
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: JSON file not found at path: ${jsonFilePath}`);
        } else if (error instanceof SyntaxError) {
            console.error("Error: Could not parse JSON. The file might be corrupt.");
        } else {
            console.error("Error reading file:", error);
        }
        return; 
    }

    // --- 2. Create the Prompt for Me ---
    const prompt = `
    Here is the text extracted from a medical lab report:
    ---
    ${reportText}
    ---
    
    Please analyze this report. Your task is to:
    1.  List all tests that are outside the normal value range.
    2.  For each abnormal test, specify if it's 'Low' or 'High'.
    3.  Provide a brief, simple summary of the findings.
    `;

    // --- 3. Call the AI Model (Send the prompt to me) ---
    try {
        console.log("Sending data to the AI agent for analysis...");
        
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiSummary = response.text();

        // 4. Print my response
        console.log("\n--- AI Analysis Complete ---");
        console.log(aiSummary);

    } catch (error) {
        console.error("An error occurred while contacting the AI:", error);
    }
}

// --- Run the analysis ---
analyzeLabReport();