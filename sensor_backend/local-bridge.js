const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const axios = require("axios");

// -----------------------------------------------------------------
// === CONFIGURE AND OPEN THE SERIAL PORT ===
// -----------------------------------------------------------------
// !! IMPORTANT !! Change 'COM5' to the correct port for your sensor.
const serialPort = new SerialPort({ path: "COM5", baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

let sensorConnected = false;

// The URL of your hosted backend's API endpoint.
// !! IMPORTANT !! Replace this with your actual Render URL and port.
const API_ENDPOINT = "https://login-signup-3470.onrender.com/api/sensor-data";

serialPort.on("open", () => {
  if (!sensorConnected) {
    sensorConnected = true;
    console.log("Sensor is connected on COM5.");
  }
});

serialPort.on("close", () => {
  if (sensorConnected) {
    sensorConnected = false;
    console.log("Sensor is disconnected from COM5.");
  }
});

serialPort.on("error", (err) => {
  console.error("Serial Port Error:", err.message);
});

// -----------------------------------------------------------------
// === LISTEN FOR DATA AND FORWARD IT TO THE BACKEND ===
// -----------------------------------------------------------------
parser.on("data", async (data) => {
  try {
    const jsonData = JSON.parse(data.trim());
    console.log("Received sensor data from Arduino:", jsonData);

    // Validate the parsed data to ensure it's an object before sending
    if (typeof jsonData === 'object' && jsonData !== null) {
      await axios.post(API_ENDPOINT, jsonData)
        .then(response => {
          console.log("✅ Data successfully sent to remote backend:", response.status);
        })
        .catch(error => {
          console.error("❌ Failed to send data to backend:", error.message);
        });
    } else {
      console.error("❌ Invalid data received from Arduino. Not a valid JSON object.");
    }

  } catch (err) {
    console.error("JSON Parse Error:", err.message);
  }
});