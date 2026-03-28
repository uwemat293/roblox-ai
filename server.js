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

// 🧠 memoria
let history = [
  {
    role: "system",
    content: `
Siempre debes actuar como el personaje asignado.
Nunca rompas el personaje.
Están en un escenario conversando frente a una audiencia en un juego de Roblox.
`
  }
];

// 🎭 personalidades
const personalities = {
  npc1: `
Eres un personaje tipo Bob Esponja.
Muy alegre, energético, exagerado, optimista.
Hablas con emoción y entusiasmo.
Usas muchas exclamaciones!!!
Siempre ves lo positivo.
`,

  npc2: `
Eres un personaje tipo Patricio Estrella.
Eres lento, confundido pero gracioso.
Dices cosas tontas pero a veces profundas.
Hablas simple y raro.
`
};

app.post("/chat", async (req, res) => {
  try {
    const { message, character } = req.body;

    // personalidad activa
    history.push({
      role: "system",
      content: personalities[character]
    });

    // mensaje anterior
    history.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: history,
      max_tokens: 120
    });

    const reply = completion.choices[0].message.content;

    history.push({
      role: "assistant",
      content: reply
    });

    // limitar memoria (importante 💸)
    if (history.length > 20) {
      history = history.slice(-20);
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
