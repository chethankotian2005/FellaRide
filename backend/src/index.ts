import { createApp } from "./app";
import { env } from "./config/env";
import { initializeFirebase } from "./config/firebase";

initializeFirebase();

const app = createApp();

app.listen(env.port, () => {
  console.log(`[fellaride-backend] listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
