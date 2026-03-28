import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎲 INICIOS RANDOM (clave 🔥)
const starters = [
  "¡Hoy es un gran día!",
  "Tengo hambre",
  "¿Qué hacemos ahora?",
  "Me siento raro hoy",
  "Creo que algo va a pasar",
  "¿Y si hacemos algo divertido?",
  "Estoy pensando en comida",
  "Tengo una idea loca"
];

// 🧠 memoria
let history = [];

// 🎭 personalidades MEJORADAS
const personalities = {
  npc1: `
Eres un personaje tipo Bob Esponja.

REGLAS:
- Máximo 1 línea
- Máximo 10 palabras
- Muy energético
- Usa !!!
- No repitas frases
- Sé espontáneo
- Nunca expliques nada

Ejemplo:
"¡Patricio! ¡Vamos ya!!!"
`,

  npc2: `
Eres un personaje tipo Patricio.

REGLAS:
- Máximo 1 línea
- Máximo 8 palabras
- Muy simple
- Respuestas tontas o raras
- A veces no entiendes
- No repitas frases

Ejemplo:
"¿Eso se come?"
`
};

app.post("/chat", async (req, res) => {
  try {
    const { message, character } = req.body;

    const messages = [
      {
        role: "system",
        content: `
Conversación corta entre dos personajes.

REGLAS:
- Respuestas MUY cortas
- No repetir frases anteriores
- No explicar nada
- Conversación rápida y natural
`
      },
      {
        role: "system",
        content: personalities[character]
      },
      ...history.slice(-6), // 🔥 solo últimas líneas
      {
        role: "user",
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 30, // 🔥 MÁS CORTO
      temperature: 1.2 // 🔥 MÁS RANDOM (menos repetición)
    });

    const reply = completion.choices[0].message.content;

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });

    // 🧠 limpiar memoria
    if (history.length > 12) {
      history = history.slice(-12);
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error IA" });
  }
});

app.get("/start", (req, res) => {
  const random = starters[Math.floor(Math.random() * starters.length)];
  res.json({ message: random });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
