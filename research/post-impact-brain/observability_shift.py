"""Latent-state observability under nuisance shift and nonlinear time evolution.

SIMULATION ONLY. Not a brain injury model, not a medical diagnostic test.
Run with: python observability_shift.py
Requirements: numpy >= 1.22
"""
import numpy as np

SEEDS = (20261115, 20261116, 20261117)
N_TRAIN = 5000
N_TEST = 3000
TIMES = np.array((0.0, 2.0, 6.0))


def generate(seed, n, nuisance_mean):
    rng = np.random.default_rng(seed)
    latent = rng.normal(size=(n, 2))  # two unrelated hidden mechanisms
    nuisance = rng.normal(nuisance_mean, 0.4, size=n)  # exercise, temperature, etc.
    decay = np.column_stack((np.exp(-TIMES / 8.0), np.exp(-TIMES / 2.0)))
    trajectory = latent[:, None, :] * decay[None, :, :]
    x = trajectory[:, :, 0]
    y = trajectory[:, :, 1]
    # Nonlinear saturated sensors, with shared nuisance component.
    a = np.tanh(0.8 * (x + y) + 0.65 * nuisance[:, None]) + rng.normal(0, 0.08, (n, 3))
    b = np.tanh(0.8 * (x - y) + 0.65 * nuisance[:, None]) + rng.normal(0, 0.08, (n, 3))
    c = 2 * a + rng.normal(0, 0.08, (n, 3))  # correlated, near-redundant channel
    proxy = nuisance + rng.normal(0, 0.12, n)  # hypothetical independent nuisance sensor
    return latent, {'A': a, 'B': b, 'C': c, 'P': proxy[:, None]}


def predict(train, test, features):
    target_tr, signal_tr = train
    target_te, signal_te = test
    train_x = np.column_stack([signal_tr[f] for f in features])
    test_x = np.column_stack([signal_te[f] for f in features])
    means = train_x.mean(0)
    scales = np.maximum(train_x.std(0), 1e-8)
    train_std = (train_x - means) / scales
    test_std = (test_x - means) / scales
    xm = np.column_stack((np.ones(len(train_std)), train_std))
    xte = np.column_stack((np.ones(len(test_std)), test_std))
    penalty = np.eye(xm.shape[1]) * 0.5
    penalty[0, 0] = 0
    beta = np.linalg.solve(xm.T @ xm + penalty, xm.T @ target_tr)
    pred = xte @ beta
    return np.array([
        1 - ((target_te[:, i] - pred[:, i]) ** 2).mean() / target_te[:, i].var()
        for i in (0, 1)
    ])


def main():
    methods = {
        'A0': ['A'],
        'A0+C0 redundant': ['A', 'C'],
        'A0+B0': ['A', 'B'],
        'A0+B0+P': ['A', 'B', 'P'],
        'A trajectory': ['A'],
        'A+B trajectories': ['A', 'B'],
        'A+B trajectories+P': ['A', 'B', 'P'],
    }
    collected = {name: {'iid': [], 'ood': []} for name in methods}
    for seed in SEEDS:
        train = generate(seed, N_TRAIN, 0)
        iid = generate(seed + 101, N_TEST, 0)
        ood = generate(seed + 202, N_TEST, 2.0)
        for name, sensors in methods.items():
            times = [0] if name.startswith('A0') else [0, 1, 2]
            def subset(data):
                z, signals = data
                return z, {key: (array[:, times] if key != 'P' else array)
                           for key, array in signals.items()}
            tr = subset(train)
            for condition, te in (('iid', iid), ('ood', ood)):
                collected[name][condition].append(predict(tr, subset(te), sensors))
    print('R2 mean across 3 seeds; target dimensions: S1 / S2; IID vs shifted nuisance')
    print('N train/test per seed:', N_TRAIN, N_TEST)
    for name, results in collected.items():
        a = np.mean(results['iid'], axis=0)
        b = np.mean(results['ood'], axis=0)
        print(f'{name:23s} IID=({a[0]:+.3f}, {a[1]:+.3f}) OOD=({b[0]:+.3f}, {b[1]:+.3f})')
    ab = np.mean(collected['A0+B0']['ood'], axis=0)
    abp = np.mean(collected['A0+B0+P']['ood'], axis=0)
    assert abp[0] > ab[0], 'Nuisance proxy failed to improve S1 under shift'
    print('PASS: nuisance proxy improves S1 reconstruction after domain shift')


if __name__ == '__main__':
    main()
