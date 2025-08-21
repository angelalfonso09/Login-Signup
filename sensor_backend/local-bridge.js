const { SerialPort, ReadlineParser } = require("serialport");
const axios = require("axios");

// !!! IMPORTANT: Replace this URL with your live backend service's URL on Render !!!
const BACKEND_URL = "https://login-signup-3470.onrender.com";

// -----------------------------------------------------------------
// === CONFIGURE SERIAL PORT ===
// -----------------------------------------------------------------
// !! IMPORTANT !! Replace 'COM5' with your Arduino's actual serial port.
const arduinoPort = new SerialPort({
  path: "COM5",
  baudRate: 9600,
});

const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: "\n" }));

console.log(`Sensor is connected on ${arduinoPort.path}.`);

// -----------------------------------------------------------------
// === READ DATA FROM ARDUINO AND SEND TO BACKEND ===
// -----------------------------------------------------------------
parser.on("data", async (data) => {
  try {
    const rawData = data.trim();

    // Check if the data is valid JSON
    if (rawData.startsWith("{") && rawData.endsWith("}")) {
      const jsonData = JSON.parse(rawData);
      console.log("Received sensor data from Arduino:", jsonData);

      // Send the sensor data to the remote backend
      const response = await axios.post(
        `${BACKEND_URL}/api/sensor-data`,
        jsonData
      );

      if (response.status === 200) {
        console.log("✅ Data successfully sent to remote backend.");
      } else {
        console.log(
          "❌ Failed to send data to backend: Response status",
          response.status
        );
      }
    } else {
      console.warn("⚠️ Received non-JSON data from Arduino, skipping:", rawData);
    }
  } catch (error) {
    console.error("❌ Failed to send data to backend:", error.message);
  }
});