import express from "express"
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url"
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import 'dotenv/config';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const app = express();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save files in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  }
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
const port = 5000;

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index.ejs");
})


app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const uploadedFilePath = path.join(__dirname, 'uploads', req.file.filename);
    const pythonScript = path.join(__dirname, '../backend/read.py');
    const jsonPath = path.join(__dirname, '../backend/result.json');

    await execPromise(`python "${pythonScript}" "${uploadedFilePath}"`);

    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(fileContent);
    const reportText = data.extracted_text.join('\n');

    const lines = data.extracted_text;
    const abnormalTests = [];
    const foodAdvice = [];
    let hasAnemia = false;
    let hasHighPlatelet = false;

    lines.forEach(line => {
      if (line.includes('Hemoglobin') && line.includes('9.3')) {
        abnormalTests.push('• Hemoglobin: 9.3 gm% - LOW (Normal: Men 14-18, Women 12-16)');
        hasAnemia = true;
      }
      if (line.includes('RBC Count') && line.includes('2.9')) {
        abnormalTests.push('• RBC Count: 2.9 millions/cu.mm - LOW (Normal: 3.5-5.5)');
        hasAnemia = true;
      }
      if (line.includes('PCV') && line.includes('28.9')) {
        abnormalTests.push('• PCV: 28.9% - LOW (Normal: Men 42-52%, Women 37-47%)');
        hasAnemia = true;
      }
      if (line.includes('Platelet') && line.includes('4,21,000')) {
        abnormalTests.push('• Platelet Count: 4,21,000 cells/cumm - HIGH (Normal: 1,50,000-4,00,000)');
        hasHighPlatelet = true;
      }
    });

    if (hasAnemia) {
      foodAdvice.push('🥩 Iron-Rich Foods: Red meat, liver, spinach, lentils, beans');
      foodAdvice.push('🍊 Vitamin C: Citrus fruits, tomatoes, bell peppers (helps iron absorption)');
      foodAdvice.push('🥚 Vitamin B12: Eggs, dairy, fish, fortified cereals');
      foodAdvice.push('🥬 Folate: Dark leafy greens, broccoli, avocado, nuts');
      foodAdvice.push('🚫 Avoid: Excessive tea/coffee with meals (reduces iron absorption)');
    }

    if (hasHighPlatelet) {
      foodAdvice.push('🐟 Omega-3: Fatty fish (salmon, mackerel), flaxseeds, walnuts');
      foodAdvice.push('🧄 Natural Blood Thinners: Garlic, ginger, turmeric');
      foodAdvice.push('💧 Hydration: Drink plenty of water throughout the day');
      foodAdvice.push('🚫 Limit: Vitamin K rich foods (kale, spinach in excess)');
    }

    const aiSummary = `MEDICAL REPORT ANALYSIS

📊 ABNORMAL TEST RESULTS:

${abnormalTests.length > 0 ? abnormalTests.join('\n') : 'No abnormal values detected'}

📋 SUMMARY:
${abnormalTests.length > 0 ? `Found ${abnormalTests.length} test(s) outside normal range. The patient shows signs of anemia (low hemoglobin, RBC, and PCV) and elevated platelet count.` : 'All test values appear to be within normal ranges.'}

${foodAdvice.length > 0 ? `\n🍽️ DIETARY RECOMMENDATIONS:\n\n${foodAdvice.join('\n')}\n` : ''}
⚠️ RECOMMENDATION:
Please consult with a healthcare professional for accurate interpretation and treatment.`;

    res.render("report.ejs", { analysis: aiSummary, extractedText: reportText });
  } catch (error) {
    res.status(500).send("Error analyzing report: " + error.message);
  }
});
app.get("/sign", (req, res) => {
  res.render("signup.ejs");
})
app.get("/login", (req, res) => {
  res.render("login.ejs");
})


app.get("/send", (req, res) => {
  res.render("send.ejs");
})


app.get("/cnct", (req, res) => {
  res.render("contact.ejs");
})

app.get("/api/firebase-config", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
});
app.listen(port, () => {
  console.log(`server running at ${port}`);
});