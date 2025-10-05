import numpy as np
import matplotlib.pyplot as plt
from fontTools.misc.cython import returns
from scipy.constants import h, c, k

# --- Synthetic dataset parameters ---
T_points = np.array([800.0, 1000.0, 1200.0])  # K
nu = np.linspace(1e12, 3e14, 400)  # Hz

# Planck spectral energy density per unit frequency (u(nu, T))
def planck_u(nu, T):
    return (8*np.pi*h*nu**3 / c**3) / (np.exp(h*nu/(k*T)) - 1)

# Generate synthetic u with small noise
np.random.seed(0)
u_T = {T: planck_u(nu, T)*(1 + 0.01*np.random.randn(len(nu))) for T in T_points}

# Convert to per-mode mean energy: mu = c^3 u / (8πν^2)
def mu_from_u(u, nu):
    return (c**3 / (8*np.pi*nu**2)) * u

mu_T = {T: mu_from_u(u_T[T], nu) for T in T_points}

# --- Derivative wrt T using central difference (at 1000 K) ---
T1, T2, T3 = T_points
mu_T1, mu_T2, mu_T3 = mu_T[T1], mu_T[T2], mu_T[T3]
dmu_dT_1000 = (mu_T3 - mu_T1) / (T3 - T1)

# --- Variance from derivative ---
Var_1000 = k * T2**2 * dmu_dT_1000
R_1000 = Var_1000 - mu_T2**2

# --- Fit discrete vs continuous model ---
# Continuous model: R = 0 (no free params)
# Discrete model: R = eps * mu (linear through origin)

eps_hat = np.sum(R_1000 * mu_T2) / np.sum(mu_T2**2)
R_pred_disc = eps_hat * mu_T2

# Compute log-likelihoods (assume Gaussian noise, sigma ~ residual std)
res_cont = R_1000 - 0
res_disc = R_1000 - R_pred_disc
sigma_est = np.std(R_1000)

logL_cont = -0.5*np.sum((res_cont/sigma_est)**2)
logL_disc = -0.5*np.sum((res_disc/sigma_est)**2)

BF = np.exp(logL_disc - logL_cont)

print(f"Estimated epsilon_hat = {eps_hat:.3e} J")
print(f"Bayes factor (Discrete vs Continuous) ≈ {BF:.2e}")

# --- Plot ---
plt.figure(figsize=(8,5))
plt.plot(mu_T2, R_1000, '.', label='Synthetic data (1000 K)')
plt.plot(mu_T2, R_pred_disc, 'r-', label='Discrete fit')
plt.axhline(0, color='k', lw=1, ls='--', label='Continuous model')
plt.xlabel(r'Mean energy $\mu$ (J)')
plt.ylabel(r'$R = Var(E)-\mu^2$ (J$^2$)')
plt.title('Discriminator $R$ vs $\mu$ at 1000 K')
plt.legend()
plt.tight_layout()
plt.show()


if __name__ == '__main__':
    exit(0)