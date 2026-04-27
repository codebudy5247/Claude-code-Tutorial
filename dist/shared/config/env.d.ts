interface EnvironmentConfig {
    port: number;
    nodeEnv: string;
    mongoUri: string;
    logLevel: string;
    appName: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}
declare class Config {
    private config;
    constructor();
    private getString;
    private getNumber;
    private validate;
    get(): EnvironmentConfig;
    isDevelopment(): boolean;
    isProduction(): boolean;
    isTest(): boolean;
}
declare const _default: Config;
export default _default;
//# sourceMappingURL=env.d.ts.map