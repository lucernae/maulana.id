import numpy as np
from scipy.constants import h, c, k
from scipy.optimize import curve_fit

np.random.seed(0)
nu = np.linspace(1e12, 3e14, 400)  # Hz
T_vals = np.linspace(600, 2000, 25)  # 25 temperatures
noise_level = 0.001

def planck_u(nu, T):
    return (8*np.pi*h*nu**3 / c**3) / (np.exp(h*nu/(k*T)) - 1)

# generate noisy u
u = np.array([planck_u(nu, T)*(1 + noise_level*np.random.randn(len(nu))) for T in T_vals])
u = np.clip(u, a_min=0, a_max=None)

# compute average energy $\langle E_\nu \rangle$
E_nu = (c**3 / (8*np.pi*nu**2)) * u  # shape (nT, nunu)

# partial derivative of E_nu by T
dmu_dT = np.zeros_like(E_nu)
for j in range(len(nu)):
    y = E_nu[:, j]
    dmu_dT[:, j] = np.gradient(y, T_vals)

# compute experimental variance of energy states
T_matrix = T_vals[:, None]
Var_experimental = k * (T_matrix**2) * dmu_dT

# compute variance difference with continuous energy distribution
R_Var_discrete = Var_experimental - E_nu**2

# choose reference T (middle)
idx_ref = len(T_vals)//2
T_ref = T_vals[idx_ref]
mu_ref = E_nu[idx_ref]
R_ref = R_Var_discrete[idx_ref]

# estimate eps_hat = R/E_nu for E_nu>0
eps_hat = np.full_like(mu_ref, np.nan)
mask = mu_ref > 0
eps_hat[mask] = R_ref[mask] / mu_ref[mask]

# fit linear and power law
mask_fit = mask & np.isfinite(eps_hat) & (eps_hat > 0)
nu_fit = nu[mask_fit]
eps_fit = eps_hat[mask_fit]

def linear(nu, alpha):
    return alpha * nu

popt_lin, pcov_lin = curve_fit(linear, nu_fit, eps_fit, maxfev=10000)
alpha_hat = popt_lin[0]
alpha_se = np.sqrt(np.diag(pcov_lin))[0]

log_nu = np.log(nu_fit)
log_eps = np.log(eps_fit)
slope, intercept = np.polyfit(log_nu, log_eps, 1)
p_hat = slope
A_hat = np.exp(intercept)

eps_lin_pred = linear(nu, alpha_hat)
eps_pow_pred = A_hat * nu**p_hat
rss_lin = np.nansum((eps_hat - eps_lin_pred)**2)
rss_pow = np.nansum((eps_hat - eps_pow_pred)**2)

results = {
    'nu': nu.tolist(),
    'E_nu': E_nu.tolist(),
    'T_vals': T_vals.tolist(),
    'eps_hat': eps_hat.tolist(),
    'eps_lin_pred': eps_lin_pred.tolist(),
}
results