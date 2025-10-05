# Retry synthetic dataset and pipeline using polynomial fit for smoothing (no scipy spline)
import numpy as np
import matplotlib.pyplot as plt
from scipy.constants import h, c, k
from scipy.optimize import curve_fit

# --- Parameters ---
np.random.seed(2)
# log_nu = np.linspace(np.log(1e12), np.log(3e14), 400)  # log Hz
# nu = np.exp(log_nu)
nu = np.linspace(1e12, 3e14, 4000)
T_vals = np.linspace(600, 2000, 25)
noise_level = 0.001

def planck_u(nu, T):
    return (8*np.pi*h*nu**3 / c**3) / (np.exp(h*nu/(k*T)) - 1)

# generate noisy u
u = np.array([planck_u(nu, T)*(1 + noise_level*np.random.randn(len(nu))) for T in T_vals])
u = np.clip(u, a_min=0, a_max=None)

# compute mu
mu = (c**3 / (8*np.pi*nu**2)) * u  # shape (nT, nunu)

# smooth in T at each frequency by fitting quadratic polynomial and take derivative
dmu_dT = np.zeros_like(mu)
for j in range(len(nu)):
    y = mu[:, j]
    dmu_dT[:, j] = np.gradient(y, T_vals)
    # # fit quadratic: y = a + b T + c T^2
    # coeffs = np.polyfit(T_vals, y, 1)
    # # derivative dy/dT = b + 2 c T
    # deriv = coeffs[1] + 2*coeffs[0]*T_vals  # note: np.polyfit gives coeffs [c, b, a]
    # dmu_dT[:, j] = deriv


# compute Var and R
T_matrix = T_vals[:, None]
Var = k * (T_matrix**2) * dmu_dT
R = Var - mu**2

# choose reference T (middle)
idx_ref = len(T_vals)//2
T_ref = T_vals[idx_ref]
mu_ref = mu[idx_ref]
R_ref = R[idx_ref]

# estimate eps_hat = R/mu for mu>0
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

# plots
plt.figure(figsize=(12,5))
plt.subplot(1,2,1)
plt.plot(nu*1e-12, mu_ref)
plt.xlabel('Frequency (THz)')
plt.ylabel('mu (J)')
plt.title(f'mu(nu) at T={T_ref:.0f}K')

plt.subplot(1,2,2)
plt.scatter(nu*1e-12, eps_hat, s=8, alpha=0.6, label='eps_hat')
plt.plot(nu*1e-12, eps_lin_pred, 'r-', lw=2, label=f'Linear fit alpha={alpha_hat:.3e} J s')
plt.plot(nu*1e-12, eps_pow_pred, 'g--', lw=2, label=f'Power fit p={p_hat:.3f}')
plt.xlabel('Frequency (THz)')
plt.ylabel('eps_hat (J)')
plt.title(f'eps_hat at T={T_ref:.0f}K')
plt.legend()
plt.tight_layout()
plt.show()

plt.figure(figsize=(6,5))
plt.scatter(mu_ref, R_ref, s=8, alpha=0.6)
plt.axhline(0, color='k', ls='--')
plt.xlabel('mu (J)')
plt.ylabel('R = Var - mu^2 (J^2)')
plt.title(f'R vs mu at T={T_ref:.0f}K')
plt.grid(True)
plt.show()

print("Reference T:", T_ref, "K")
print("alpha_hat (J s):", alpha_hat)
print("alpha_hat / h:", alpha_hat / h)
print("power p_hat:", p_hat)
print("RSS linear:", rss_lin, "RSS power:", rss_pow)
