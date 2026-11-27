# Transcription littérale de ClassQuench.Calcul (Pyrofluid VB.NET), pour contrôle croisé.
# Source : Pyrofluid VB.NET, « 05 Traitement fumées / Voie Humide / Class Humide / ClassQuench.vb » (Drive 1_VALIDATION_PYRO).
# Reprend Carre et LOG10 du module Global. Débits volumiques d'entrée = masse × 22,4 / M (comme l'outil).
from math import log, log10, exp, sqrt, pi
M = dict(CO2=44, H2O=18, O2=32, N2=28, SO2=64, HCl=36.5)
CONE = {0.55: 445, 0.65: 535, 0.75: 615, 0.9: 735, 1.05: 860, 1.25: 1025, 1.5: 1230}
LIQMAX = {0.55: 5000, 0.65: 7500, 0.75: 8000, 0.9: 10000, 1.05: 15000, 1.25: 20000, 1.5: 25000}

def carre(a, b, c):
    d = b * b - 4 * a * c
    r1 = r2 = 0.0
    res = 0.0
    if d > 0:
        if a == 0:
            return 0.0 if b == 0 else -c / b
        if sqrt(d) - b > 0:
            r1 = (sqrt(d) - b) / (2 * a); r2 = (-sqrt(d) - b) / (2 * a)
        if r1 > 0 and r2 < 0: res = r1
        if r1 < 0 and r2 > 0: res = r2
    return res

def calc(inp):
    m = dict(CO2=inp['mCO2'], H2O=inp['mH2O'], N2=inp['mN2'], O2=inp['mO2'], SO2=inp['mSO2'], HCl=inp['mHCl'])
    v = {k: m[k] * 22.4 / M[k] for k in m}
    VolTot = sum(v.values()); MasTot = sum(m.values()); Tin = inp['tempFumees']
    D = inp['diamQuench']; EffV = inp['effVenturi']; DG = inp['diamGouttes']; Nu = inp['constNusselt']
    CoefHS = inp['coefHautSat']; Tap = inp['tempEauAp']
    def ent(T):
        return (T * (0.226*m['CO2'] + 0.427*m['H2O'] + 0.225*m['O2'] + 0.239*m['N2'] + 0.164*m['SO2'] + 0.19*m['HCl'])
                + T**2 * (46.5e-6*m['CO2'] + 80.5e-6*m['H2O'] + 24.5e-6*m['O2'] + 27e-6*m['N2'] + 25.5e-6*m['SO2'] + 11.5e-6*m['HCl'])
                + m['H2O'] * 597)
    psat = lambda t: 10 ** (7.9688 - 1668.21 / (228 + t))
    DeltaBoucle2 = 0.5
    while True:
        ComptB1 = 0; ComptB2 = 0
        p = 760 - abs(inp['pTotal'] / 13.595)
        ts = 60.0
        ConcHClRec = 0.01; ConcHClAr = 0.05
        DebVolTotalReel = (VolTot * (273.5 + Tin) * 760) / (273.5 * p)
        Squench = pi * D**2 / 4
        Vitesse = DebVolTotalReel / (3600 * Squench)
        fm = {k: m[k] / MasTot for k in m}
        EntEntree = ent(Tin)
        def evac(t):
            return ((0.427*t + 80.5e-6*t**2) + 597 - t) * (1 - ConcHClAr/100) + (ConcHClAr/100) * (0.19*t + 11**(-6) * t**2 + 497 - 0.96*t)
        DeltaP1 = 1e7
        while True:
            Tv = psat(ts)
            evap = (EntEntree - ent(ts)) / evac(ts)
            Pp = p * (v['H2O'] + evap/0.804) / (VolTot + evap/0.804)
            DeltaP = abs(Tv - Pp)
            if DeltaP <= DeltaP1:
                DeltaP1 = DeltaP; ts += 0.1; ComptB1 += 1
            if DeltaP > DeltaP1 or ComptB1 == 10000: break
        ts = (ts - 0.1) / 1.0005
        Tv = psat(ts) * 0.9954
        evap = (EntEntree - ent(ts)) / evac(ts)
        ComptB2 = 0
        while True:
            AT = exp(-13.83 + 0.108032*ts); BT = exp(1.03684 - 0.00467532*ts)
            PHCl = AT * ConcHClRec ** BT
            Pinc = p - Tv - PHCl
            fmolHCl = PHCl / p; fmolE = 1 - fmolHCl
            den = fmolHCl*M['HCl'] + fmolE*M['H2O']
            H2Oeq = fmolE*M['H2O']/den*evap; HCleq = fmolHCl*M['HCl']/den*evap
            ms = dict(m); ms['H2O'] = m['H2O'] + H2Oeq; ms['HCl'] = m['HCl'] + HCleq
            vs = dict(v); vs['H2O'] = ms['H2O']*22.4/18; vs['HCl'] = ms['HCl']*22.4/36.5
            MasS = sum(ms.values()); VolS = sum(vs.values())
            RoS = MasS / (VolS * ((ts + 273)/273) * (760/p))
            MolInc = (1000/22.4) * (VolS - vs['H2O'] - vs['HCl'])
            HClAbs = ms['HCl'] - (PHCl/Pinc) * MolInc * (36.5/1000)
            me = dict(CO2=m['CO2'], H2O=(Tv/Pinc)*MolInc*(18/1000), O2=m['O2'], N2=m['N2'], SO2=m['SO2'], HCl=ms['HCl'] - HClAbs*EffV)
            MasE = sum(me.values())
            ve = {k: me[k]*22.4/M[k] for k in me}
            ve['CO2'] = v['CO2']; ve['O2'] = v['O2']; ve['N2'] = v['N2']; ve['SO2'] = v['SO2']
            VolE = sum(ve.values()); VolESec = VolE - ve['H2O']
            O2 = ve['O2'] / VolESec * 100
            ConcHClsec = (me['HCl'] / VolESec) * 1e6 * 10 / (21 - O2)
            VolSortieReel = VolE * ((ts + 273)/273) * (760/p)
            RoE = MasE / VolSortieReel
            diamc = inp['diamCone'] if inp['chkCone'] else CONE.get(D, 0)
            Sv = pi * (diamc*1e-3)**2 / 4; Sp = Squench - Sv
            Vp = VolSortieReel / (3600 * Sp)
            Pv = 1.5 * RoS * Vp**2 / (2*9.81)
            Tm = (Tin + ts) / 2
            Cpg = ((0.235*fm['CO2'] + 0.232*fm['N2'] + 0.258*fm['O2'] + 0.457*fm['H2O'] + 0.184*fm['HCl'] + 0.12*fm['SO2'])
                   + 1e-5*(6.22*fm['CO2'] + 3.57*fm['N2'] + 0.8*fm['O2'] + 0.833*fm['H2O'] + 2.3*fm['HCl'] + 8.27*fm['SO2'])*(Tm+273)
                   + 1e-8*(7.44*fm['H2O'] - 1.29*fm['SO2'])*(Tm+273)**2 - (4443.2*fm['CO2'] + 5865.6*fm['O2'])/(Tm+273)**3)
            RoL = 0.3471 * 0.274 ** (-((1 - (ts+273)/(374.2+273)) ** (2/7))) * 1000
            Kl = (-916.62 + 1254.73*(Tm+273)*1e-2 - 152.12e-4*(Tm+273)**2) * 3.6e-4
            LiqAr = min(11 * evap, LIQMAX[D])
            Te = (600 / Nu) * (((DG*1e-6)**2 * Cpg * RoL / Kl) * (MasTot / LiqAr))
            Zsat = CoefHS * Te * Vitesse
            pH = -log10(ConcHClAr * (10/36.5)) if ConcHClAr > 0 else float("nan")
            HClPurge = m['HCl'] - me['HCl']
            Purge = 100 * HClPurge / ConcHClRec
            Appoint = MasE - MasTot + Purge
            Recirc = LiqAr + MasTot - MasE - Purge
            HClRecirc = Recirc * (ConcHClRec/100)
            pHRec = -log10(ConcHClRec * (10/36.5))
            ConcHClAr = 100 * HClRecirc / (Recirc + Appoint)
            EntTot = EntEntree + Appoint*Tap + HClPurge*0.5556*850 + evap*(ts - Tap) - Purge*0.96*ts
            a = 1e-6*(me['CO2']*46.5 + me['H2O']*80.5 + me['O2']*24.5 + me['N2']*27 + me['SO2']*25.5 + me['HCl']*11.5)
            b = me['CO2']*0.226 + me['H2O']*0.427 + me['N2']*0.239 + me['O2']*0.225 + me['SO2']*0.164 + me['HCl']*0.19
            c = -(EntTot - me['H2O']*597)
            Tout = carre(a, b, c)
            R = dict(ts=ts, tensVapH2O=Tv, debMasEvap=evap, vitesse=Vitesse, roSaturee=RoS, roEpuree=RoE, mH2Oep=me['H2O'], mHClep=me['HCl'],
                     concHClSec=ConcHClsec, vPassage=Vp, pVenturi=Pv, cpg=Cpg, te=Te, zsat=Zsat, pH=pH, pHRec=pHRec,
                     debMasTotalPurge=Purge, debMasEauAppoint=Appoint, debMasTotalRecirc=Recirc, concHClAr=ConcHClAr, concHClRec=ConcHClRec,
                     tempSortie=Tout, debMasLiqAr=LiqAr)
            Diff = abs(ts - Tout)
            ComptB2 += 1
            ConcHClRec += 0.0001
            if Diff < DeltaBoucle2 or ComptB2 == 20000: break
        if ComptB2 == 20000: DeltaBoucle2 += 0.5
        if ComptB2 < 20000 or DeltaBoucle2 > 2: break
    R['comptB2'] = ComptB2; R['deltaBoucle2'] = DeltaBoucle2
    return R
