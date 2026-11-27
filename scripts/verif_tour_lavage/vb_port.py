# Transcription littérale de ClassTourLavage.Calcul (Pyrofluid VB.NET), pour contrôle croisé.
# Source : Pyrofluid VB.NET, « 05 Traitement fumées / Voie Humide / Class Humide / ClassTourLavage.vb » (Drive 1_VALIDATION_PYRO).
# Reprend aussi Arrondi05 du module Global. Les valeurs initiales PourcentH2O et ConcentHClSortie valent 0 (ouverture de la fenêtre).
from math import log, exp, sqrt, pi, floor
M = dict(CO2=44, H2O=18, O2=32, N2=28, SO2=64, HCl=36.5, NaOH=40)
def arrondi05(v):
    dec = 0.5 - (v - floor(v))
    if dec < 0: return floor(v) + 1
    if dec < 0.1: return floor(v) + 0.5
    return floor(v)
def calc(inp, SousRef, TypeVerif, PourcentH2O_init=0.0, ConcentHClSortie_init=0.0):
    m = dict(CO2=inp['mCO2'], H2O=inp['mH2O'], N2=inp['mN2'], O2=inp['mO2'], SO2=inp['mSO2'], HCl=inp['mHCl'])
    v = {k: m[k] * 22.4 / M[k] for k in m}
    VolTot = sum(v.values()); MasTot = sum(m.values())
    Tin = inp['tempFumees']; recup_Ts = inp['tsQuench']; RoEpuree = inp['roEpureeQuench']
    TempLiqRef = inp['tempLiqRef']; FacteurGarn = inp['facteurGarn']; L = inp['debArrosage']
    SurfaceVolGarn = inp['surfaceVolGarn']; DiamGarn = inp['diamGarn']; SigmaTenSup = inp['sigmaTenSup']
    ConcentSO2Sortie = inp['cibleSO2']; ConcLiquSO2 = inp['concLiqSO2'] / 100; EpaisDeves = inp['epaisDeves']
    D = inp['diamRetenu']; Ent_in = None
    p = 760 - abs(inp['pTotal'] / 13.595)
    VolSecIn = VolTot - v['H2O']
    PourcentO2Entree = v['O2'] / VolSecIn * 100
    ConcentHClEntree = (m['HCl'] * 1e6 / VolSecIn) * (10 / (21 - PourcentO2Entree))
    ConcentSO2Entree = (m['SO2'] * 1e6 / VolSecIn) * (10 / (21 - PourcentO2Entree))
    def ent(T, mm, lat):
        return (T * (0.226*mm['CO2'] + 0.427*mm['H2O'] + 0.225*mm['O2'] + 0.239*mm['N2'] + 0.164*mm['SO2'] + 0.19*mm['HCl'])
                + T**2 * (46.5e-6*mm['CO2'] + 80.5e-6*mm['H2O'] + 24.5e-6*mm['O2'] + 27e-6*mm['N2'] + 25.5e-6*mm['SO2'] + 11.5e-6*mm['HCl'])
                + mm['H2O'] * lat)
    Ent_in = ent(Tin, m, 597)
    psat = lambda t: 10 ** (7.9688 - 1668.21 / (228 + t))
    muL = lambda t: 1e-3 * 10 ** (-10.73 + 1828/(273+t) + 1.966e-2*(273+t) - 14.66e-6*(273+t)**2)
    roL = lambda t: 0.3471 * 0.274 ** (-((1 - (t+273)/(374.2+273)) ** (2/7))) * 1000
    sigL = lambda t: 71.97e-3 * ((374.2 - t) / (374.2 - 25)) ** 0.8105
    def muG(y, T):
        s = {k: sqrt(M[k]) for k in M}
        v4 = y['CO2']*s['CO2'] + y['H2O']*s['H2O'] + y['O2']*s['O2'] + y['N2']*s['N2']
        v1 = (25.45*y['CO2']*s['CO2'] + 30.43*y['N2']*s['N2'] + 18.11*y['O2']*s['O2'] - 31.89*y['H2O']*s['H2O']) / v4
        v2 = (0.4549*y['CO2']*s['CO2'] + 0.4989*y['N2']*s['N2'] + 0.6632*y['O2']*s['O2'] + 0.4145*y['H2O']*s['H2O']) / v4
        v3 = (-8.649e-5*y['CO2']*s['CO2'] - 1.093e-4*y['N2']*s['N2'] - 1.879e-4*y['O2']*s['O2'] - 8.272e-6*y['H2O']*s['H2O']) / v4
        return (v1 + v2*(T+273) + v3*(T+273)**2) * 1e-7
    R = {}
    PourcentH2O = PourcentH2O_init
    ConcentHClSortie = ConcentHClSortie_init
    if SousRef == 1:
        Tc = inp['tempSortieCond']
        PsatC = psat(Tc)
        MolIncond = (VolTot - v['H2O'] - v['HCl']) * 1000 / 22.4
        MolSortieCond = PsatC * MolIncond / (p - PsatC)
        mH2Oc = MolSortieCond * 18e-3
        mc = dict(m); mc['H2O'] = mH2Oc
        EntSortieCond = ent(Tc, mc, 547)
        DeltaEnt = Ent_in - EntSortieCond
        CpLiq = 0.6741 + 2.825e-3*(TempLiqRef+273) - 8.371e-6*(TempLiqRef+273)**2 + 8.601e-9*(TempLiqRef+273)**3
        DebEauMasCond = m['H2O'] - mH2Oc
        DebEauEntreeCond = ((DeltaEnt / CpLiq) - Tin * DebEauMasCond) / (Tin - TempLiqRef)
        DebMasEauEntreeCond = DebEauEntreeCond + 25000
        DebMasEauSortieCond = DebMasEauEntreeCond + DebEauMasCond
        TempSortieLiq = ((DeltaEnt / CpLiq) + DebMasEauEntreeCond * TempLiqRef) / DebMasEauSortieCond
        d1 = Tin - TempSortieLiq; d2 = TempLiqRef - Tc
        if d2 == 0: dT = 0
        else:
            d2 = abs(d2); dT = (d1 - d2) / log(d1 / d2)
        Tm = (Tin + Tc) / 2
        Cpg = (8.1 - 0.72e-3*(Tm+273) + 3.63e-6*(Tm+273)**2 - 1.16e-9*(Tm+273)**3) / 18
        ChalSenIn = Ent_in - m['H2O'] * 597
        ChalSenOut = EntSortieCond - mH2Oc * 597
        DeltaChalSen = ChalSenIn - ChalSenOut
        vc = dict(v); vc['H2O'] = m['H2O'] * 22.4 / 18   # bug VB : volume d'eau de l'entrée
        MasTotC = sum(mc.values()); VolTotC = sum(vc.values())
        y = {k: vc[k] / VolTotC for k in vc}
        PourcentO2 = vc['O2'] / (VolTotC - vc['H2O']) * 100
        TL = Tc
        muLa, mu20 = muL(TL), muL(20); roLa, ro20 = roL(TL), roL(20)
        nu, nu20 = muLa/roLa, mu20/ro20; sig = sigL(TL)
        muF = muG(y, Tc)
        roF = MasTotC / (VolTotC * ((Tc + 273) / 273))
        vf1 = (L / MasTotC) * sqrt(roF / roLa); vf2 = exp(-4 * vf1 ** 0.25)
        FluxEngor = 3600 * sqrt((vf2 * 9.81 * roF * roLa) / (FacteurGarn * (nu/nu20) ** 0.2))
        FluxReel = 0.7 * FluxEngor
        DiamCalc = sqrt(4 * (MasTotC / FluxReel) / pi)
        Sec = pi * D**2 / 4
        V = ((dT * 9/5 + 32) * (DebEauMasCond * 2.2046) * Cpg) / (DeltaChalSen * 3.9683)
        if V < 1:
            H1 = ((-DebEauMasCond * 2.2046 * Cpg) / (0.0146 * ((MasTot / Sec) * 0.2048) ** 0.82 * ((DebMasEauEntreeCond / Sec) * 0.2048) ** 0.47 * (Sec * 10.7643) * log(1 - V))) ** 1.613
        else: H1 = 0
        HauteurCond = H1 * 0.3048 * 1.5
        TauxMouil = (L / Sec) / (SurfaceVolGarn * roLa); TauxEngor = ((MasTotC / Sec) / FluxEngor) * 100
        G = MasTotC / (Sec * 3600); Lp = L / (Sec * 3600)
        Ga = 9.81 * DiamGarn**3 * roLa**2 / muLa**2; We = DiamGarn * Lp**2 / (roLa * sig)
        aw = SurfaceVolGarn * (1 - exp(-1.45 * (SigmaTenSup/sig) ** 0.75 * (SurfaceVolGarn*DiamGarn) ** -0.35 * Ga ** 0.05 * We ** 0.2))
        Re = G / (SurfaceVolGarn * muF)
        cO = 5.23 if DiamGarn > 0.015 else 2
        DSO2 = 0.122e-4 * ((273 + Tc) / 273); ScSO2 = muF / (roF * DSO2)
        kSO2 = ((cO * DSO2 * SurfaceVolGarn) / (8.314 * Tc)) * Re ** 0.7 * ScSO2 ** (1/3) * (1 / (SurfaceVolGarn * DiamGarn)) ** 2
        HutSO2 = G / (roF * 8.314 * Tc * aw * kSO2)
        DHCl = (273 + Tc) ** 1.75 / (1e8 * (p / 760) * (14.9*y['CO2'] + 11.6*y['N2'] + 11.7*y['O2'] + 9.1*y['H2O']))
        ScHCl = muF / (roF * DHCl)
        kHCl = ((cO * DHCl * SurfaceVolGarn) / (8.314 * Tc)) * Re ** 0.7 * ScHCl ** (1/3) * (1 / (SurfaceVolGarn * DiamGarn)) ** 2
        HutHCl = G / (roF * 8.314 * Tc * aw * kHCl)
        VolSortieSec = VolTotC - vc['H2O']
        O2s = PourcentO2; VolTotS = VolTotC; VolH2OS = vc['H2O']
        if ConcentHClEntree < ConcentHClSortie: ConcentHClSortie = ConcentHClEntree
        if ConcentSO2Entree < ConcentSO2Sortie: ConcentSO2Sortie = ConcentSO2Entree
        while True:
            NutSO2 = log((mc['SO2'] * 1e6 / VolTotC) / (((50 * (21 - O2s)) / 10) * ((VolTotS - VolH2OS) / VolTotS)))
            HGSO2 = NutSO2 * HutSO2 * 1.5 + 0.49
            NutHCl = log((mc['HCl'] * 1e6 / VolTotC) / (((10 * (21 - O2s)) / 10) * ((VolTotS - VolH2OS) / VolTotS)))
            HGHCl = NutHCl * HutHCl * 1.5 + 0.49
            PourcentH2O = (VolTotS - VolH2OS) / VolTotS
            mSO2s = ConcentSO2Sortie * 1e-6 * ((21 - O2s) / 10) * VolSortieSec
            mHCls = ConcentHClSortie * 1e-6 * ((21 - O2s) / 10) * VolSortieSec
            mH2Os = m['H2O'] - DebEauMasCond
            MasTotS = mc['CO2'] + mc['N2'] + mc['O2'] + mSO2s + mHCls + mH2Os
            VolH2OS = mH2Os * 22.4 / 18
            VolTotS = vc['CO2'] + vc['N2'] + vc['O2'] + mSO2s*22.4/64 + mHCls*22.4/36.5 + VolH2OS
            VolSortieSec = VolTotS - VolH2OS
            O2test = vc['O2'] / VolSortieSec * 100
            diff = abs(O2s - O2test)
            ConcentHClSortie = ((mc['HCl'] * 1e6 / VolSortieSec) * (10 / (21 - O2s))) / exp(HGHCl / HutSO2)
            RoS = MasTotS / (VolTotS * ((Tc + 273) / 273))
            O2s = O2test
            if diff < 1e-5: break
        if TypeVerif == 1:
            dPG = 0.1 * exp(1.97275 + 1.293 * ((VolTotC / (3600 * Sec)) * ((Tc + 273) / 273) * roF ** 2))
        else:
            a1 = 21.79 - 36.19 * vf1 ** 0.25 + 16.6 * sqrt(vf1); a2 = 7.06 + 10.3 * vf1 ** 0.25 - 10.36 * sqrt(vf1)
            a3 = ((MasTotC / (3600 * Sec)) * FacteurGarn * (nu/nu20) ** 2) / (9.81 * roF * roLa)
            dPG = (98 * (a3 / vf2) * (a1 + a2 * (a3 / vf2))) / 9.81
        SO2Purge = mc['SO2'] - mSO2s
        PurgeAbs = SO2Purge / ConcLiquSO2
        VitD = 0.08 * 3600 * sqrt((roLa - RoS) / RoS)
        SecD = MasTotS / (RoS * VitD); DiamD = sqrt(4 * SecD / pi)
        VitF = MasTotS / (pi * DiamD**2 / 4)
        dPD = 0.0169 * RoS * EpaisDeves * (VitF / 3600) ** 1.85
        R.update(hauteurCond=HauteurCond, eauEntreeCond=DebEauEntreeCond, condensat=DebEauMasCond, tSortieLiq=TempSortieLiq)
    else:
        TL = Tin
        PsatQ = psat(recup_Ts)
        muLa, mu20 = muL(TL), muL(20); roLa, ro20 = roL(TL), roL(20)
        nu, nu20 = muLa/roLa, mu20/ro20; sig = sigL(TL)
        y = {k: v[k] / VolTot for k in v}
        PourcentO2 = v['O2'] / VolSecIn * 100
        muF = muG(y, Tin); roF = RoEpuree
        vf1 = (L / MasTot) * sqrt(roF / roLa); vf2 = exp(-4 * vf1 ** 0.25)
        FluxEngor = 3600 * sqrt((vf2 * 9.81 * roF * roLa) / (FacteurGarn * (nu/nu20) ** 0.2))
        FluxReel = 0.7 * FluxEngor
        DiamCalc = sqrt(4 * (MasTot / FluxReel) / pi)
        Sec = pi * D**2 / 4
        TauxMouil = (L / Sec) / (SurfaceVolGarn * roLa); TauxEngor = ((MasTot / Sec) / FluxEngor) * 100
        G = MasTot / (Sec * 3600); Lp = L / (Sec * 3600)
        Ga = 9.81 * DiamGarn**3 * roLa**2 / muLa**2; We = DiamGarn * Lp**2 / (roLa * sig)
        aw = SurfaceVolGarn * (1 - exp(-1.45 * (SigmaTenSup/sig) ** 0.75 * (SurfaceVolGarn*DiamGarn) ** -0.35 * Ga ** 0.05 * We ** 0.2))
        Re = G / (SurfaceVolGarn * muF)
        cO = 5.23 if DiamGarn > 0.015 else 2
        DSO2 = 0.122e-4 * ((273 + Tin) / 273); ScSO2 = muF / (roF * DSO2)
        kSO2 = ((cO * DSO2 * SurfaceVolGarn) / (8.314 * Tin)) * Re ** 0.7 * ScSO2 ** (1/3) * (1 / (SurfaceVolGarn * DiamGarn)) ** 2
        HutSO2 = G / (roF * 8.314 * Tin * aw * kSO2)
        DHCl = (273 + Tin) ** 1.75 / (1e8 * (p / 760) * (14.9*y['CO2'] + 11.6*y['N2'] + 11.7*y['O2'] + 9.1*y['H2O']))
        ScHCl = muF / (roF * DHCl)
        kHCl = ((cO * DHCl * SurfaceVolGarn) / (8.314 * Tin)) * Re ** 0.7 * ScHCl ** (1/3) * (1 / (SurfaceVolGarn * DiamGarn)) ** 2
        HutHCl = G / (roF * 8.314 * Tin * aw * kHCl)
        MolIncondS = (v['CO2'] + v['N2'] + v['O2']) * 1000 / 22.4
        VolSortieSec = VolTot - v['H2O']
        O2s = PourcentO2; VolTotS = VolTot; VolH2OS = v['H2O']
        if ConcentHClEntree < ConcentHClSortie: ConcentHClSortie = ConcentHClEntree
        if ConcentSO2Entree < ConcentSO2Sortie: ConcentSO2Sortie = ConcentSO2Entree
        while True:
            NutSO2 = log((v['SO2'] * 1e6 / VolTot) / (((50 * (21 - O2s)) / 10) * ((VolTotS - VolH2OS) / VolTotS)))
            HGSO2 = NutSO2 * HutSO2 * 1.5 + 0.049
            NutHCl = log((v['HCl'] * 1e6 / VolTot) / (((10 * (21 - O2s)) / 10) * ((VolTotS - VolH2OS) / VolTotS)))
            HGHCl = NutHCl * HutHCl * 1.5 + 0.49
            mSO2s = ConcentSO2Sortie * 1e-6 * ((21 - O2s) / 10) * VolSortieSec * ((100 - PourcentH2O) / 100)
            mHCls = ConcentHClSortie * 1e-6 * ((21 - O2s) / 10) * VolSortieSec * ((100 - PourcentH2O) / 100)
            mH2Os = (PsatQ / (760 - PsatQ)) * MolIncondS * 18 / 1000
            MasTotS = m['CO2'] + m['N2'] + m['O2'] + mSO2s + mHCls + mH2Os
            VolH2OS = mH2Os * 22.4 / 18
            VolTotS = v['CO2'] + v['N2'] + v['O2'] + mSO2s*22.4/64 + mHCls*22.4/36.5 + VolH2OS
            VolSortieSec = VolTotS - VolH2OS
            O2test = v['O2'] / VolSortieSec * 100
            diff = abs(O2s - O2test)
            ConcentHClSortie = ((m['HCl'] * 1e6 / VolSortieSec) * (10 / (21 - O2s))) / exp(HGHCl / HutSO2)
            RoS = MasTotS / (VolTotS * ((Tin + 273) / 273))
            O2s = O2test
            if diff < 1e-5: break
        if TypeVerif == 1:
            dPG = 0.1 * exp(1.97275 + 1.293 * ((VolTot / (3600 * Sec)) * ((Tin + 273) / 273) * roF ** 2))
        else:
            a1 = 21.79 - 36.19 * vf1 ** 0.25 + 16.6 * sqrt(vf1); a2 = 7.06 + 10.3 * vf1 ** 0.25 - 10.36 * sqrt(vf1)
            a3 = ((MasTot / 3600 / Sec) ** 2 * FacteurGarn * (nu/nu20) ** 0.2) / (9.81 * roF * roLa)
            dPG = (98 * (a3 / vf2) * (a1 + a2 * (a3 / vf2))) / 9.81
        SO2Purge = m['SO2'] - mSO2s
        PurgeAbs = SO2Purge / ConcLiquSO2
        VitD = 0.08 * 3600 * sqrt((roLa - RoS) / RoS)
        SecD = MasTotS / (RoS * VitD); DiamD = arrondi05(sqrt(4 * SecD / pi))
        VitF = MasTotS / (pi * DiamD**2 / 4)
        dPD = 0.0169 * RoS * EpaisDeves * (VitF / 3600) ** 1.85
    HG = (HGSO2 + HGHCl) * inp['coefHautSat']
    P = inp['pourNaOH']; Conc = 0.1026*P*P + 10.167*P; RoN = (0.0106*P + 1.003) * 1000
    NaOH = RoN * (((m['SO2'] - mSO2s) / 64) * 40 * 2 / Conc) + RoN * (((m['HCl'] - mHCls) / 36.5) * 40 / Conc)
    R.update(fluxEngor=FluxEngor, diamCalc=DiamCalc, tauxMouil=TauxMouil, tauxEngor=TauxEngor, aw=aw, Re=Re,
             hutSO2=HutSO2, hutHCl=HutHCl, nutSO2=NutSO2, nutHCl=NutHCl, hGarnSO2=HGSO2, hGarnHCl=HGHCl, hGarnRetenue=HG,
             masSO2s=mSO2s, masHCls=mHCls, masH2Os=mH2Os, masTotS=MasTotS, concHClSortie=ConcentHClSortie, roSortie=RoS,
             dPGarn=dPG, diamDeves=DiamD, dPDeves=dPD, purgeAbs=PurgeAbs, masNaOHTot=NaOH)
    return R
