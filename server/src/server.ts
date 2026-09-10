import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./app";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 OTP Verification Server running at http://localhost:${port}`);
  console.log(`📖 API Docs: http://localhost:${port}/docs`);
});
