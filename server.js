import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 memoria de conversación
let history = [
  {
    role: "system",
    content: "Esta es una conversación entre dos NPCs en un juego de Roblox."
  }
];

// 🎭 personalidades
const personalities = {
  npc1: "Eres NPC1, sarcástico, divertido, haces bromas.",
  npc2: "Eres NPC2, serio, inteligente y lógico."
};

// 🔁 endpoint principal
app.post("/chat", async (req, res) => {
  try {
    const { message, character } = req.body;

    // agregamos personalidad
    history.push({
      role: "system",
      content: personalities[character]
    });

    // mensaje recibido
    history.push({
      role: "user",
      content: message
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // barato y rápido
      messages: history,
      max_tokens: 100
    });

    const reply = completion.choices[0].message.content;

    // guardamos respuesta
    history.push({
      role: "assistant",
      content: reply
    });

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en IA" });
  }
});

// 🌐 puerto para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});