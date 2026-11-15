"""Synthetic identifiability study; NOT medical diagnostic validation."""
import numpy as np
rng = np.random.default_rng(20261115)
n = 30000
z = rng.normal(size=(n, 2))
noise = 0.30
# A observes a sum; B observes an independent difference; C is redundant.
a = z[:, 0] + z[:, 1] + rng.normal(0, noise, n)
b = z[:, 0] - z[:, 1] + rng.normal(0, noise, n)
c = 2 * a + rng.normal(0, noise, n)
y = z[:, 0]
cut = 21000

def evaluate(cols):
    x = np.column_stack([np.ones(n), *cols])
    beta = np.linalg.lstsq(x[:cut], y[:cut], rcond=None)[0]
    pred = x[cut:] @ beta
    return float(1 - np.mean((y[cut:] - pred)**2) / np.var(y[cut:]))

for name, cols in [
    ('A only', [a]),
    ('A + redundant C', [a, c]),
    ('A + independent B', [a, b]),
    ('A + B + C', [a, b, c]),
]:
    print(f'{name}: R2={evaluate(cols):.4f}')
print('Synthetic Gaussian latent states; linear sensors; 21k train, 9k test.')
