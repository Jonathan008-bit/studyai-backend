import express from "express";
import cors from "cors";
import OpenAI from "openai";
import multer from "multer";
import pdf from "pdf-parse/lib/pdf-parse.js";

const app = express();
const upload = multer(); // Guarda archivos temporalmente en memoria

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Esto lo configuraremos en Render después
});

app.post("/process", upload.array("files"), async (req, res) => {
  try {
    let combinedText = "";
    const mode = req.body.mode;

    // Procesar cada archivo subido
    if (req.files) {
      for (const file of req.files) {
        if (file.mimetype === "application/pdf") {
          const data = await pdf(file.buffer);
          combinedText += data.text + "\n";
        } else {
          combinedText += file.buffer.toString("utf-8") + "\n";
        }
      }
    }

    let prompt = "";
    if (mode === "summary") prompt = `Resume de forma estructurada:\n${combinedText}`;
    if (mode === "learn") prompt = `Explica esto con analogías sencillas:\n${combinedText}`;
    if (mode === "quiz") prompt = `Crea un test de 5 preguntas con respuestas:\n${combinedText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ result: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
