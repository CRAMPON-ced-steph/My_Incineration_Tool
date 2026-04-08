import {fh_CO2,fh_H2O, fh_O2,fh_N2,fh_AIR} from '../A_Transverse_fonction/enthalpy_gas';
import {CpL_T, hL_T}  from '../A_Transverse_fonction/steam_table3.js';


// FONCTIONS UTILSEES POUR LE QUENCH
export const Qeau_remove_to_be_at_T = (T_in, t_eau, t_out, m_CO2, m_H2O, M_N2, M_O2) => {
  let q1, q2, qc, h1;

  h1 = h_fumee(t_out, m_CO2, m_H2O, M_N2, M_O2);
  q1 = 0;
  q2 = m_H2O;

  do {
    qc = (q1 + q2) / 2;
    const tc = temp_bef_add_wat(qc, t_eau, t_out, m_CO2, m_H2O, M_N2, M_O2);
    if (tc > T_in) {
      q2 = qc;
    } else {
      q1 = qc;
    }
  } while (Math.abs(q1 - q2) >= 0.1);

  return qc;
};


export const temp_bef_add_wat= (qeau_ajout, t_eau, t_flue_gas, m_CO2, m_H2O, M_N2, M_O2) => {
  let h1, h2, h3;

  h1 = h_fumee(t_flue_gas, m_CO2, m_H2O, M_N2, M_O2);
  h2 = qeau_ajout * (t_eau * CpL_T(t_eau) - fh_H2O(t_flue_gas));
  h3 = h1 - h2;
  
  return TEMP_FUMEE(h3, m_CO2, m_H2O - qeau_ajout, M_N2, M_O2);
};

export const TEMP_FUMEE = (H, m_CO2, m_H2O, M_N2, M_O2) => {
  let t1c = 0;
  let t2c = 3000;
  let tc, h2;

  const h1 = h_fumee(t1c, m_CO2, m_H2O, M_N2, M_O2);

  do {
    tc = (t1c + t2c) / 2;
    h2 = h_fumee(tc, m_CO2, m_H2O, M_N2, M_O2);
    
    if (h2 > H) {
      t2c = tc;
    } else {
      t1c = tc;
    }
  } while (Math.abs(t2c - t1c) >= 0.001);

  return tc;
};

export const h_fumee = (T, m_CO2, m_H2O, M_N2, M_O2) => {
  const H_CO2 = fh_CO2(T) * m_CO2;
  const H_H2O = (fh_H2O(T) + 540 * 4.1868) * m_H2O;
  const H_N2 = fh_N2(T) * M_N2;
  const H_O2 = fh_O2(T) * M_O2;
  
  return H_CO2 + H_N2 + H_O2 + H_H2O;
};



//FORMULE UTILISEE POUR LE BHF



export const AIR_DILUTION_T = (t_air, tfum2, tfum1, m_CO2, m_H2O, M_N2, M_O2) => {
  let q1 = m_CO2 + m_H2O + M_N2 + M_O2;
  let q2 = 0;
  let qc, t3c;

  do {
      qc = (q1 + q2) / 2;
      t3c = TEMP_FUMEE_AIR_EXTRAIT(qc, t_air, tfum1, m_CO2, m_H2O, M_N2, M_O2);
      if (t3c > tfum2) {
          q1 = qc;
      } else {
          q2 = qc;
      }
  } while (Math.abs(q1 - q2) >= 0.1);

  return qc/1.293;
};

export const TEMP_FUMEE_AIR_EXTRAIT = (qair_ext, t_air, t1, m_CO2, m_H2O, M_N2, M_O2) => {
  let h1 = h_fumee(t1, m_CO2, m_H2O, M_N2 - 0.767 * qair_ext, M_O2 - 0.233 * qair_ext);
  h1 += qair_ext * (fh_AIR(t1) - fh_AIR(t_air));

  return TEMP_FUMEE(h1, m_CO2, m_H2O, M_N2 - 0.767 * qair_ext, M_O2 - 0.233 * qair_ext);
};  



export const Q_AIR_DILUTION = (T_air, tfum1, tfum2, m_CO2, m_H2O, M_N2, M_O2, M_inert) => {



  const H1 = h_fumee(tfum1, m_CO2, m_H2O, M_N2, M_O2); // + M_inert * 0.25 * 4.186 * tfum1
  const H2 = h_fumee(tfum2, m_CO2, m_H2O, M_N2, M_O2); // + M_inert * 0.25 * 4.186 * tfum2
  const ha1 = fh_AIR(T_air);
  const ha2 = fh_AIR(tfum2);
  const qc = (H1 - H2) / (ha2 - ha1);

  return qc;
};





export const TEMP_FUMEE_INC = (H, m_CO2, m_H2O, M_N2, M_O2) => {
  let t1c = 0;
  let t2c = 4000;
  let tc, H1;

  do {
    tc = (t1c + t2c) / 2;
    H1 = h_fumee_incine(tc, m_CO2, m_H2O, M_N2, M_O2);
    if (H1 > H) {
      t2c = tc;
    } else {
      t1c = tc;
    }
  } while (Math.abs(t2c - t1c) >= 0.01);

  return tc;
};


const h_fumee_incine = (T, m_CO2, m_H2O, M_N2, M_O2) => {
  const H_CO2 = fh_CO2(T) * m_CO2;
  const H_H2O = fh_H2O(T) * m_H2O;
  const H_N2 = fh_N2(T) * M_N2;
  const H_O2 = fh_O2(T) * M_O2;
  
  return H_CO2 + H_N2 + H_O2 + H_H2O;
};



export const Qeau_added_to_be_at_T = (T_in, T_eau, T_out, Pth, m_CO2, m_H2O, M_N2, M_O2) => {
  let H_in_quench, H_out_quench, Delta_H, Q_eau_kg_h;

  H_in_quench = h_fumee(T_in, m_CO2, m_H2O, M_N2, M_O2);
  H_out_quench = h_fumee(T_out, m_CO2, m_H2O, M_N2, M_O2);

  let qeau_ajout = 0;
  let T_quench = temp_after_add_wat(qeau_ajout, T_eau, T_in, m_CO2, m_H2O, M_N2, M_O2);

  while (T_quench > T_out) {
    qeau_ajout += 1;
    T_quench = temp_after_add_wat(qeau_ajout, T_eau, T_in, m_CO2, m_H2O, M_N2, M_O2);
  }

  Delta_H = H_in_quench * (1 - Pth / 100) - H_out_quench;
  Q_eau_kg_h = Delta_H / (fh_H2O(T_out) - hL_T(T_eau) + 540 * 4.1868);

  return Q_eau_kg_h + qeau_ajout;
};

export const temp_after_add_wat = (qeau_ajout, T_eau, T_flue_gas, m_CO2, m_H2O, M_N2, M_O2) => {
  let h1, h2, h3;

  h1 = h_fumee(T_flue_gas, m_CO2, m_H2O, M_N2, M_O2);
  h2 = qeau_ajout * (fh_H2O(T_flue_gas) - T_eau * CpL_T(T_eau));
  h3 = h1 + h2;

  return TEMP_FUMEE(h3, m_CO2, m_H2O + qeau_ajout, M_N2, M_O2);
};