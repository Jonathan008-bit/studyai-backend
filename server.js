import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: "18/03/2026",
});

// prueba
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// IA
app.post("/process", async (req, res) => {
  const { text, mode } = req.body;

  let prompt = "";

  if (mode === "summary") {
    prompt = `Resume este texto:\n${text}`;
  }

  if (mode === "learn") {
    prompt = `Explícame este contenido paso a paso:\n${text}`;
  }

  if (mode === "quiz") {
    prompt = `Crea 5 preguntas tipo test con 4 alternativas y marca la correcta:\n${text}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      result: response.choices[0].message.content,
    });
  } catch (error) {
  console.error("ERROR REAL:", error);
  res.status(500).json({
    error: "Error con OpenAI",
    detalle: error.message
  });
  }
});

app.listen(3000, () => {
  console.log("Servidor activo");
});
