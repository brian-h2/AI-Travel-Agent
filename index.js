// --- Elementos del DOM ---
// Pantallas
const screenHome = document.getElementById('screen-home');
const screenForm = document.getElementById('screen-form');
const screenResults = document.getElementById('screen-results');

// Botones de navegación
const btnStart = document.getElementById('btn-start');
const btnPlan = document.getElementById('btn-plan');
const btnBack = document.getElementById('btn-back');

// Elementos del formulario
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const countSpan = document.getElementById('travellers-count');
const inputFrom = document.getElementById('input-from');
const inputTo = document.getElementById('input-to');
const inputFromDate = document.getElementById('input-from-date');
const inputToDate = document.getElementById('input-to-date');
const inputBudget = document.getElementById('input-budget');

// Elementos de resultados
const resFromDate = document.getElementById('res-from-date');
const resToDate = document.getElementById('res-to-date');
const resFrom = document.getElementById('res-from');
const resTo = document.getElementById('res-to');
const resWeather = document.getElementById('res-weather');
const resFlights = document.getElementById('res-flights');
const resHotel = document.getElementById('res-hotel');

// --- Lógica de Interfaz ---

// Función para cambiar de pantallas ocultando/mostrando contenedores
function showScreen(screen) {
    screenHome.classList.add('hidden');
    screenForm.classList.add('hidden');
    screenResults.classList.add('hidden');
    screenHome.classList.remove('active');
    screenForm.classList.remove('active');
    screenResults.classList.remove('active');

    screen.classList.remove('hidden');
    screen.classList.add('active');
}

btnStart.addEventListener('click', () => {
    showScreen(screenForm);
});

btnBack.addEventListener('click', () => {
    showScreen(screenForm);
});

// Contador de viajeros
let travellers = 1;
btnPlus.addEventListener('click', () => {
    travellers++;
    countSpan.textContent = travellers;
});

btnMinus.addEventListener('click', () => {
    if (travellers > 1) {
        travellers--;
        countSpan.textContent = travellers;
    }
});

// --- Lógica Principal: Planear Viaje ---
btnPlan.addEventListener('click', async () => {
    // 1. Recolectar datos del formulario
    const requestData = {
        travellers: travellers,
        from: inputFrom.value,
        to: inputTo.value,
        fromDate: inputFromDate.value,
        toDate: inputToDate.value,
        budget: inputBudget.value
    };

    // Validar datos básicos
    if (!requestData.from || !requestData.to || !requestData.budget) {
        alert("Please fill in all fields (origin, destination, and budget).");
        return;
    }

    // 2. Mostrar pantalla de resultados y poner textos de carga
    showScreen(screenResults);

    // Rellenar cabecera de resultados con los datos ingresados
    resFromDate.textContent = requestData.fromDate;
    resToDate.textContent = requestData.toDate;
    resFrom.textContent = requestData.from;
    resTo.textContent = requestData.to;

    // Estados de carga para que el usuario sepa que la IA está pensando
    resFlights.textContent = "Finding the best flight options with AI...";
    resHotel.textContent = "Finding the ideal accommodation...";
    resWeather.textContent = "Checking the weather...";

    try {
        // 3. Enviar datos a nuestro servidor Node.js
        const response = await fetch('http://localhost:3000/api/plan-trip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        // 4. Renderizar respuesta de la IA en pantalla
        if (result.success) {
            const jsonResponse = result.data;
            resFlights.textContent = jsonResponse.flights;
            resHotel.textContent = jsonResponse.hotel;

            // Mostrar el clima obtenido de la API
            resWeather.textContent = result.data.weather;
        } else {
            alert("Error planning the trip: " + result.error);
        }

    } catch (error) {
        console.error("Error conectando con el servidor:", error);
        alert("Make sure your Node.js server is running (execute 'node server.js' in the terminal)");
    }
});