"""V1: Drosophila ion-channel -> membrane bridge (ADR-0006).

Fidelity hierarchy per channel population:
    2 fine   : Markov kinetic scheme (occupancy ODE), state-dependent processes
    1 medium : Hodgkin-Huxley gating (independent gates)
    0 coarse : reduced current (instantaneous activation, HH inactivation)
"""
