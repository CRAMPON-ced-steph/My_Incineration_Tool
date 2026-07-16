// Libère le port 5173 avant `npm run dev` (lancé automatiquement via le script "predev").
// Tue uniquement les processus node.exe qui écoutent sur ce port (anciennes instances
// Vite zombies) — jamais une autre application.
const { execSync } = require('child_process');

const PORT = 5173;

const run = (cmd) => {
  try { return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString(); }
  catch { return ''; }
};

// netstat sans -p : inclut TCP (IPv4) ET TCPv6 — Vite écoute souvent sur [::1]
const netstat = run('netstat -ano');
const pids = new Set();
for (const line of netstat.split(/\r?\n/)) {
  if (/^\s*TCP/i.test(line) && line.includes(`:${PORT} `) && /LISTENING/i.test(line)) {
    const pid = line.trim().split(/\s+/).pop();
    if (pid && pid !== '0') pids.add(pid);
  }
}

for (const pid of pids) {
  const name = run(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
  if (/node\.exe/i.test(name)) {
    run(`taskkill /F /PID ${pid}`);
    console.log(`[free-port] Ancienne instance Vite (PID ${pid}) tuée — port ${PORT} libéré.`);
  } else if (name.trim()) {
    console.warn(`[free-port] Le port ${PORT} est occupé par un autre programme (PID ${pid}) — non tué.`);
  }
}
