import matplotlib.pyplot as plt
import numpy as np
from scipy.integrate import quad
from scipy.stats import norm


def complex_quad(func, a, b, **kwargs):
    def real_func(x):
        return func(x).real

    def imag_func(x):
        return func(x).imag

    real_integral = quad(real_func, a, b, **kwargs)
    imag_integral = quad(imag_func, a, b, **kwargs)
    return real_integral[0] + 1j * imag_integral[1], real_integral[1:], imag_integral[1:]


def characteristic_function(pdf):
    def _c(t):
        integrand = lambda x: np.exp(1j * t * x) * pdf(x)
        return complex_quad(integrand, -np.inf, np.inf)[0]

    return _c


# Example usage with Standard Normal distribution
norm_pdf = norm().pdf
dist = norm(loc=0, scale=0.001)
neg_freq = norm(loc=-1, scale=0.001).pdf
pos_freq = norm(loc=1, scale=0.001).pdf


def binomial_pdf(x):
    return (neg_freq(x) + pos_freq(x)) / 2


t_values = np.arange(-100, 100) / 100  # array of t from 0 to 100
cf = np.vectorize(characteristic_function(norm_pdf))
complex_results = cf(t_values)
# Return t-values and results as list of list
real_parts = list(map(np.real, complex_results))
imag_parts = list(map(np.imag, complex_results))

# Return t-values and parts as list of list
results = [t_values.tolist(), real_parts, imag_parts]
results

# Extract the data from results
t_values, real_parts, imag_parts = results

# Create a figure and axis objects
fig, ax1 = plt.subplots()

# pdf_results = np.vectorize(binomial_pdf)(t_values)
# color = 'tab:green'
# ax1.set_xlabel('t_values')
# ax1.set_ylabel('PDF', color=color)
# ax1.plot(t_values, pdf_results.tolist(), color=color)
# ax1.tick_params(axis='y', labelcolor=color)

# plot real part
color = 'tab:blue'
ax1.set_xlabel('t_values')
ax1.set_ylabel('Real Part', color=color)
ax1.plot(t_values, real_parts, color=color)
ax1.tick_params(axis='y', labelcolor=color)

# Create a second axis for the imaginary part
ax2 = ax1.twinx()
color = 'tab:red'
ax2.set_ylabel('Imaginary Part', color=color)
ax2.plot(t_values, imag_parts, color=color)
ax2.tick_params(axis='y', labelcolor=color)

fig.tight_layout()
plt.show()
