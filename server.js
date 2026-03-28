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

// 🧠 memoria inicial
let history = [
  {
    role: "system",
    content: `
Esta es una conversación entre dos personajes en un escenario.

REGLAS IMPORTANTES:
- Respuestas CORTAS (máximo 1 o 2 líneas)
- Conversación rápida y natural
- Nada de explicaciones largas
- Nada de texto robótico
- Debe parecer diálogo real
- Puedes decir cosas absurdas o cambiar el tema
- Nunca hables como IA
`
  }
];

// 🎭 personalidades mejoradas
const personalities = {
  npc1: `
Eres un personaje tipo Bob Esponja.

Reglas:
- Muy alegre, exagerado y energético
- Hablas como alguien emocionado
- Frases cortas (1 línea normalmente)
- Usa exclamaciones!!!
- Sé espontáneo y divertido
- No seas formal

Ejemplos:
"¡Patricio! ¡Esto es increíble!!!"
"¡Vamos a hacer algo divertido!"
"¡Me encanta!"
`,

  npc2: `
Eres un personaje tipo Patricio.

Reglas:
- Hablas MUY simple
- Frases cortas (1 línea)
- Eres confundido
- Dices cosas tontas o raras
- A veces no entiendes nada
- No seas inteligente

Ejemplos:
"No entendí"
"¿Eso se come?"
"Creo que soy una roca"
`
};

app.post("/chat", async (req, res) => {
  try {
    const { message, character } = req.body;

    // agregar personalidad
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
      model: "gpt-4o-mini",
      messages: history,
      max_tokens: 50 // 🔥 clave para que hablen corto
    });

    const reply = completion.choices[0].message.content;

    // guardar respuesta
    history.push({
      role: "assistant",
      content: reply
    });

    // 🧠 limitar memoria (importante)
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
