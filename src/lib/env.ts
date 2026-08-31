type RequiredServerVar =
  | "DATABASE_URL"
  | "RAZORPAY_KEY_ID"
  | "RAZORPAY_KEY_SECRET"
  | "LLM_API_KEY";

function assertEnv(name: RequiredServerVar): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getServerEnv() {
  return {
    databaseUrl: assertEnv("DATABASE_URL"),
    razorpayKeyId: assertEnv("RAZORPAY_KEY_ID"),
    razorpayKeySecret: assertEnv("RAZORPAY_KEY_SECRET"),
    llmApiKey: assertEnv("LLM_API_KEY"),
  };
}
