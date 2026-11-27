// Contrôle croisé : calculTour (mode « Calcul Pyrofluid d'origine ») contre la transcription
// littérale de ClassTourLavage.Calcul (vb_port.py), sur les cas de cas.json.
// Usage, depuis la racine du dépôt : node scripts/verif_tour_lavage/comparer.mjs
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ici = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'tl-'));
const bundle = join(tmp, 'tl.mjs');
await esbuild.build({
  stdin: { contents: "export { calculTour } from './src/Y_BILAN/SCRUBBER/4_SCRUBBER_TourLavage.jsx';", resolveDir: join(ici, '../..'), loader: 'js' },
  bundle: true, format: 'esm', platform: 'node', outfile: bundle, loader: { '.js': 'jsx', '.jsx': 'jsx' }, jsx: 'automatic', logLevel: 'error',
});
const { calculTour } = await import(pathToFileURL(bundle).href);
const cas = JSON.parse(readFileSync(join(ici, 'cas.json'), 'utf8'));
const js = cas.map((c) => calculTour({ ...c.inp, sousRef: !!c.sr, typeGarn: c.tv === 1 ? 'VSP' : 'Autres', modeOrigine: true }));
writeFileSync(join(tmp, 'js.json'), JSON.stringify(js));
const script = `
import json, sys
sys.dont_write_bytecode = True
sys.path.insert(0, ${JSON.stringify(ici)})
from vb_port import calc
cas = json.load(open(${JSON.stringify(join(ici, 'cas.json'))})); js = json.load(open(${JSON.stringify(join(tmp, 'js.json'))}))
pire = 0
for c, j in zip(cas, js):
    vb = calc(c['inp'], c['sr'], c['tv'])
    vb.pop('eauEntreeCond', None)
    e = max(abs((j[k] if k in j else j['cond'][k]) - v) / abs(v) * 100 for k, v in vb.items() if v)
    pire = max(pire, e)
    print(f"{c['nom']:52s} écart max {e:.5f} %")
sys.exit(0 if pire < 0.01 else 1)
`;
execFileSync('python3', ['-I', '-c', script], { stdio: 'inherit' });
