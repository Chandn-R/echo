export function checkEnv(requiredVars: string[]) {
  const missingVars: string[] = [];

  for (const v of requiredVars) {
    if (!process.env[v]) {
      missingVars.push(v);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
  
  console.log("Environment variables validated.");
}