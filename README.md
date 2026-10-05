# AI Travel Agent ✈️

A modern, full-stack travel planning application powered by Artificial Intelligence. 
This application takes user preferences (destination, dates, budget, and party size) and generates a curated travel itinerary including flight options, hotel accommodations, and real-time weather forecasts.

## 🌟 Features
- **Smart Itineraries**: Integrates with OpenAI to generate tailored flight and hotel recommendations based on budget and dates.
- **Real-Time Weather**: Uses WeatherAPI to provide up-to-date weather forecasts for the destination.
- **Premium UI**: Designed with a sleek, modern Glassmorphism aesthetic, featuring animated gradients, smooth transitions, and responsive design.
- **Secure Architecture**: Built with a Node.js/Express backend to securely handle API calls and protect sensitive keys.

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Glassmorphism design)
- **Backend**: Node.js, Express.js, CORS
- **APIs**: OpenAI API (gpt-4o-mini), WeatherAPI

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- An API Key from [OpenAI](https://platform.openai.com/).
- An API Key from [WeatherAPI](https://www.weatherapi.com/).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/brian-h2/AI-Travel-Agent.git
   cd AI-Travel-Agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   WEATHER_API_KEY=your_weatherapi_key_here
   ```

4. Start the server:
   ```bash
   node server.js
   ```

5. Open `index.html` in your browser or serve it using a local server.

## 🔒 Security Note
The `.env` file containing sensitive API keys is included in `.gitignore` and is never pushed to the repository. The Node.js backend acts as a secure proxy to interact with the AI and Weather APIs, ensuring keys are not exposed to the client-side browser.
