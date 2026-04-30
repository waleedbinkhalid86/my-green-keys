import { initializePaddle, type Paddle } from "@paddle/paddle-js";

type PaddleEvent = { name?: string; data?: unknown };
type PaddleEventListener = (event: PaddleEvent) => void;

let paddlePromise: Promise<Paddle | undefined> | null = null;
const listeners = new Set<PaddleEventListener>();

function getPublicEnv() {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    throw new Error(
      "Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN. Add it to .env.local and restart the dev server."
    );
  }
  return { token };
}

export function onPaddleEvent(listener: PaddleEventListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getPaddle() {
  if (!paddlePromise) {
    const { token } = getPublicEnv();
    paddlePromise = initializePaddle({
      environment: "sandbox",
      token,
      eventCallback: (event) => {
        listeners.forEach((l) => l(event as unknown as PaddleEvent));
      },
    });
  }

  return paddlePromise;
}

