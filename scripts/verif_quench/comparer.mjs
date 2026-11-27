// Contrôle croisé : calculQuench (nœud QUENCH) et calculSaturator (nœud SATURATOR), mode
// « Calcul Pyrofluid d'origine », contre la transcription littérale de ClassQuench.Calcul
// (vb_quench.py), sur les cas de cas.json.
// Usage, depuis la racine du dépôt : node scripts/verif_quench/comparer.mjs
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'qu-'));
const bundle = join(tmp, 'qu.mjs');
await esbuild.build({
  stdin: {
    contents: "export { calculQuench } from './src/Y_BILAN/QUENCH/4_QUENCH_Design1_ML.jsx';\n"
      + "export { calculSaturator } from './src/Y_BILAN/SATURATOR/4_SATURATOR_Design1_ML.jsx';",
    resolveDir: join(ici, '../..'), loader: 'js',
  },
  bundle: true, format: 'esm', platform: 'node', outfile: bundle, loader: { '.js': 'jsx', '.jsx': 'jsx' }, jsx: 'automatic', logLevel: 'error',
});
const { calculQuench, calculSaturator } = await import(pathToFileURL(bundle).href);
const cas = JSON.parse(readFileSync(join(ici, 'cas.json'), 'utf8'));
const extrait = (r) => (r && !r.erreurTs ? {
  ts: r.ts, tensVapH2O: r.tensVapH2O, debMasEvap: r.debMasEvap, vitesse: r.vitesse, roSaturee: r.roSaturee, roEpuree: r.roEpuree,
  mH2Oep: r.masEp.H2O, mHClep: r.masEp.HCl, concHClSec: r.concHClSec, vPassage: r.vPassage, pVenturi: r.pVenturi, cpg: r.cpg,
  te: r.te, zsat: r.zsat, pH: r.pH, pHRec: r.pHRec, debMasTotalPurge: r.debMasTotalPurge, debMasEauAppoint: r.debMasEauAppoint,
  debMasTotalRecirc: r.debMasTotalRecirc, concHClAr: r.concHClAr, concHClRec: r.concHClRec, tempSortie: r.tempSortie, debMasLiqAr: r.debMasLiqAr,
} : null);
const js = {
  QUENCH: cas.map((c) => extrait(calculQuench({ ...c.inp, modeOrigine: true }))),
  SATURATOR: cas.map((c) => extrait(calculSaturator({ ...c.inp, modeOrigine: true }))),
};
writeFileSync(join(tmp, 'js.json'), JSON.stringify(js));
const script = `
import json, sys
sys.dont_write_bytecode = True
sys.path.insert(0, ${JSON.stringify(ici)})
from vb_quench import calc
cas = json.load(open(${JSON.stringify(join(ici, 'cas.json'))})); js = json.load(open(${JSON.stringify(join(tmp, 'js.json'))}))
pire = 0
for noeud, res in js.items():
    for c, j in zip(cas, res):
        vb = calc(c['inp'])
        if j is None:
            print(f"{noeud:10s} {c['nom']:40s} erreur de calcul JS"); pire = 100; continue
        e = max(abs(j[k] - v) / abs(v) * 100 for k, v in vb.items() if k in j and v and v == v)
        pire = max(pire, e)
        print(f"{noeud:10s} {c['nom']:40s} écart max {e:.5f} %")
sys.exit(0 if pire < 0.01 else 1)
`;
execFileSync('python3', ['-I', '-c', script], { stdio: 'inherit' });
