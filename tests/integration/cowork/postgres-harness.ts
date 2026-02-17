import { execSync } from 'child_process';

export interface PostgresHarness {
  containerName: string;
  connectionString: string;
  stop: () => void;
}

export function startPostgresHarness(suffix: string): PostgresHarness {
  const port = 5600 + Math.floor(Math.random() * 200);
  const containerName = `cowork-pg-${suffix}-${Date.now()}`;

  execSync(
    `docker run -d --rm --name ${containerName} -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=opencode -p ${port}:5432 postgres:16-alpine`,
    { stdio: 'ignore' }
  );

  const connectionString = `postgresql://postgres:postgres@127.0.0.1:${port}/opencode`;

  const start = Date.now();
  let ready = false;
  while (!ready && Date.now() - start < 30000) {
    try {
      execSync(`docker exec ${containerName} pg_isready -U postgres`, { stdio: 'ignore' });
      ready = true;
    } catch (error) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
    }
  }

  if (!ready) {
    execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' });
    throw new Error('Postgres harness failed to start');
  }

  return {
    containerName,
    connectionString,
    stop: () => {
      execSync(`docker rm -f ${containerName}`, { stdio: 'ignore' });
    }
  };
}

export function hasDocker(): boolean {
  try {
    execSync('docker version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}
