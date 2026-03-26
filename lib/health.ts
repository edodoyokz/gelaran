type DependencyCheck = () => Promise<void>;

export type ReadinessResult = {
  ok: boolean;
  status: "ready" | "not_ready";
  reason?: string;
};

export async function notifyReadinessFailure(message: string, webhookUrl?: string) {
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        source: "readiness-check",
        message,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    return;
  }
}

export async function runReadinessCheck(checks: DependencyCheck[]): Promise<ReadinessResult> {
  try {
    for (const check of checks) {
      await check();
    }

    return {
      ok: true,
      status: "ready",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Dependency check failed";

    return {
      ok: false,
      status: "not_ready",
      reason,
    };
  }
}
