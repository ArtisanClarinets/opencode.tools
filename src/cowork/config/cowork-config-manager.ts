export interface CoworkPersistenceConfig {
  connectionString: string;
  schema: string;
  runMigrations: boolean;
  poolMax: number;
  tenantId: string;
}

export class CoworkConfigManager {
  private static instance: CoworkConfigManager | null = null;

  private constructor(private readonly persistenceConfig: CoworkPersistenceConfig) {}

  public static getInstance(overrides?: Partial<CoworkPersistenceConfig>): CoworkConfigManager {
    if (!CoworkConfigManager.instance) {
      CoworkConfigManager.instance = new CoworkConfigManager(CoworkConfigManager.fromEnv(overrides));
      return CoworkConfigManager.instance;
    }

    if (overrides) {
      CoworkConfigManager.instance = new CoworkConfigManager(CoworkConfigManager.fromEnv(overrides));
    }

    return CoworkConfigManager.instance;
  }

  public static resetForTests(): void {
    CoworkConfigManager.instance = null;
  }

  public getPersistenceConfig(): CoworkPersistenceConfig {
    return this.persistenceConfig;
  }

  private static fromEnv(overrides?: Partial<CoworkPersistenceConfig>): CoworkPersistenceConfig {
    return {
      connectionString:
        overrides?.connectionString ||
        process.env.COWORK_DATABASE_URL ||
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/opencode',
      schema: overrides?.schema || process.env.COWORK_DB_SCHEMA || 'cowork',
      runMigrations: overrides?.runMigrations ?? process.env.COWORK_RUN_MIGRATIONS !== 'false',
      poolMax: overrides?.poolMax ?? Number.parseInt(process.env.COWORK_DB_POOL_MAX || '10', 10),
      tenantId: overrides?.tenantId || process.env.COWORK_TENANT_ID || 'default'
    };
  }
}
