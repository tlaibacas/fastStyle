const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();

// Function to make GET request and log results
const startCronJob = async () => {
  const currentTime = new Date();
  console.log(`Cron job executed at ${currentTime.toLocaleTimeString()}`);

  // Obtém a URL da API do arquivo .env
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    console.error("API URL is not defined in the .env file.");
    return;
  }

  try {
    const response = await axios.get(apiUrl);
    console.log(`API response:`, response.data);
  } catch (error) {
    console.error(`Error during API request:`, error.message);
  }
};

cron.schedule("0,10,20,30,40,50 * * * *", startCronJob);
