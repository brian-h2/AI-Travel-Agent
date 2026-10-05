require('dotenv').config(); // Carga las variables del archivo .env
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// En desarrollo el frontend se sirve desde el mismo origen (localhost:3000),
// así que no hace falta habilitar otros orígenes salvo que lo definas explícitamente.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Sin "origin" = petición desde el mismo servidor (curl, Postman, o el propio frontend servido por Express)
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS'));
    }
}));
app.use(express.json({ limit: '10kb' })); // Limita el tamaño del body para evitar payloads abusivos
app.use(express.static('.')); // Sirve los archivos estáticos (index.html, index.css, index.js)

// Rate limiting: máximo 10 peticiones cada 15 minutos por IP en el endpoint que gasta cuota de OpenAI
const planTripLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' }
});

// Inicializar OpenAI
// TODO: Tienes que crear la instancia de OpenAI usando process.env.OPENAI_API_KEY
// const openai = new OpenAI({ ... });

const openaAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
    You are an expert and helpful travel agent.
    Your task is to plan the best possible trip based on user preferences.
    You must ALWAYS respond in strict JSON format.

    Expected response:
    {
        "flights": "Your short recommendation on flights and airlines",
        "hotel": "Your short recommendation on a hotel in that city that fits the budget",
        "weather": "Your short recommendation on the weather in that city"
    }
`
// Ruta para procesar el viaje
app.post('/api/plan-trip', planTripLimiter, async (req, res) => {
    try {
        // 1. Recibir los datos del frontend
        const { travellers, from, to, fromDate, toDate, budget } = req.body;

        // Validación básica: evita mandar campos vacíos/mal tipados a la IA
        // (y evita gastar cuota de OpenAI con requests basura)
        if (
            typeof from !== 'string' || !from.trim() ||
            typeof to !== 'string' || !to.trim() ||
            from.length > 100 || to.length > 100
        ) {
            return res.status(400).json({ success: false, error: 'Origen y destino son obligatorios (máx. 100 caracteres).' });
        }

        const travellersNum = Number(travellers);
        if (!Number.isInteger(travellersNum) || travellersNum < 1 || travellersNum > 20) {
            return res.status(400).json({ success: false, error: 'Número de viajeros inválido.' });
        }

        const budgetNum = Number(budget);
        if (!Number.isFinite(budgetNum) || budgetNum <= 0 || budgetNum > 1_000_000) {
            return res.status(400).json({ success: false, error: 'Presupuesto inválido.' });
        }

        if (!Date.parse(fromDate) || !Date.parse(toDate)) {
            return res.status(400).json({ success: false, error: 'Fechas inválidas.' });
        }

        // 2. Llamamos a WeatherAPI
        let textoClima = "Weather information unavailable (missing API key).";
        if (process.env.WEATHER_API_KEY) {
            try {
                const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${to}`;
                const weatherFetch = await fetch(weatherUrl);
                if (weatherFetch.ok) {
                    const weatherData = await weatherFetch.json();
                    const temp = weatherData.current.temp_c;
                    const condicion = weatherData.current.condition.text;
                    textoClima = `Expect ${condicion} weather with around ${temp}°C.`;
                } else {
                    console.log("Error de WeatherAPI:", await weatherFetch.text());
                }
            } catch (errorClima) {
                console.error("No se pudo obtener el clima:", errorClima);
            }
        }
        // 3. Crear el "Prompt" para OpenAI
        const prompt = `
            I have a client who wants to travel from ${from} to ${to}.
            There are ${travellers} travellers.
            The dates are from ${fromDate} to ${toDate}.
            The total budget is $${budget}.
        `;

        // 4. Llamar a OpenAI

        const response = await openaAi.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" } // ¡IMPORTANTE! Esto obliga a la IA a devolver un JSON puro
        });

        // La IA devuelve un texto, debemos convertirlo a un objeto de Javascript
        const jsonString = response.choices[0].message.content;
        const dataObject = JSON.parse(jsonString);

        // 5. Enviar respuesta al frontend
        res.json({
            success: true,
            data: {
                flights: dataObject.flights,
                hotel: dataObject.hotel,
                weather: textoClima
            }
        });

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ success: false, error: "There was an error planning the trip" });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
