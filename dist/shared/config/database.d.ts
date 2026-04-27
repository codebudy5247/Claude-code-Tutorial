declare class Database {
    connect(uri?: string): Promise<void>;
    disconnect(): Promise<void>;
    clearDatabase(): Promise<void>;
}
declare const _default: Database;
export default _default;
//# sourceMappingURL=database.d.ts.map