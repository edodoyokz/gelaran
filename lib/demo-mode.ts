import type { PublicEnv } from "./env";

export type AppStage = PublicEnv["NEXT_PUBLIC_APP_STAGE"];

export function getAuthDemoConfig(stage: AppStage) {
    const enabled = stage === "local";

    return {
        enabled,
        defaultExpanded: enabled,
    };
}
