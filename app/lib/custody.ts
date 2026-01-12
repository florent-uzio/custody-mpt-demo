import { RippleCustody } from "custody";

let custodyInstance: RippleCustody | null = null;

export function getCustodySDK(): RippleCustody {
  if (!custodyInstance) {
    const authUrl = process.env.AUTH_URL;
    const apiUrl = process.env.API_URL;
    const privateKey = process.env.PRIVATE_KEY || "";
    const publicKey = process.env.PUBLIC_KEY || "";

    if (!authUrl || !apiUrl) {
      throw new Error(
        "Missing required environment variables: AUTH_URL and API_URL"
      );
    }

    custodyInstance = new RippleCustody({
      authUrl,
      apiUrl,
      privateKey,
      publicKey,
    });

    console.log("RippleCustody SDK initialized (singleton)");
  }

  return custodyInstance;
}

