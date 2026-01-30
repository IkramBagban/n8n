import axios from "axios";

// const BEARER_TOKEN = process.env.X_BEARER_TOKEN; // keep it secret
const BEARER_TOKEN =
  "AAAAAAAAAAAAAAAAAAAAAJ5o5QEAAAAAaFVK7AgPIdSVw9J0u%2FF3m70Rgv8%3DPbb2mAYikS4X0VpcIVRCfYXPURecWj4vp9dHM5fBfJbkMSey5M"; // keep it secret

async function postTweet(text: string) {
  try {
     let response = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify({ text }),

      //   {
      //     headers: {
      //       Authorization: `Bearer ${BEARER_TOKEN}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
    });

    const data = await response.json();
    console.log(" Tweet posted:", data);
  } catch (error: any) {
    console.log("error",error)
    console.error(
      " Error posting tweet:",
      error.response?.data || error.message
    );
  }
}

postTweet("Hello world  posting via X API!");
