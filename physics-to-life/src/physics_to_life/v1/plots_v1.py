"""Figures for the V1 experiment (same palette/style conventions as evaluation/plots.py)."""
from __future__ import annotations
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from ..evaluation.plots import _style_axes, _save, INK, INK2, MUTED, GRID, SEQ_BLUE

STYLE = {
    "voc":          dict(color="#2a78d6", ls="-",  marker="o", label="VoC learned (one-shot)"),
    "voc_seq":      dict(color="#2a78d6", ls="--", marker="o", label="VoC learned (sequential)"),
    "hybrid":       dict(color="#4a3aa7", ls="-",  marker="P", label="hybrid: physics candidates + learned ranking"),
    "hybrid_seq":   dict(color="#4a3aa7", ls="--", marker="P", label="hybrid (sequential)"),
    "hardlabel":    dict(color="#e87ba4", ls="-",  marker="X", label="hard-label learned (V0-style)"),
    "share":        dict(color="#eda100", ls="-",  marker="^", label="current-share heuristic"),
    "discrepancy":  dict(color="#eb6834", ls="-",  marker="s", label="medium-vs-coarse discrepancy monitor"),
    "random":       dict(color="#1baf7a", ls="-",  marker="v", label="random"),
    "oracle_voc":   dict(color="#008300", ls=":",  marker="*", label="oracle VoC (hidden truth)"),
}
UNI = {"uniform_coarse": "coarse", "uniform_medium": "medium", "uniform_fine": "fine"}


def pareto(tab, path, title, family="id", xcol="cost_frac_fine", ycol="err_rel_tol_mean", policies=None):
    t = tab[tab.family == family]
    fig, ax = plt.subplots(figsize=(7.4, 4.6)); _style_axes(ax)
    handles = []
    for pol in (policies or [p for p in STYLE if p in set(t.policy)]):
        st = STYLE[pol]; g = t[t.policy == pol].sort_values(xcol)
        if g.empty:
            continue
        ax.plot(g[xcol], g[ycol], color=st["color"], ls=st["ls"], lw=1.6, marker=st["marker"], ms=4.5, mec="white", mew=0.6, zorder=3)
        if "err_lo" in g:
            yerr = np.vstack([np.maximum(g[ycol] - g["err_lo"], 0), np.maximum(g["err_hi"] - g[ycol], 0)])
            ax.errorbar(g[xcol], g[ycol], yerr=yerr, fmt="none", ecolor=st["color"], elinewidth=0.7, alpha=0.5, capsize=0, zorder=2)
        handles.append(Line2D([], [], color=st["color"], ls=st["ls"], marker=st["marker"], ms=5, lw=1.6, label=st["label"]))
    for pol, lab in UNI.items():
        g = t[t.policy == pol]
        if g.empty:
            continue
        x, y = float(g[xcol].iloc[0]), float(g[ycol].iloc[0])
        ax.scatter([x], [y], s=46, color=MUTED, zorder=4, edgecolor="white", linewidth=0.8)
        ax.annotate(lab, (x, y), xytext=(6, 4), textcoords="offset points", fontsize=8, color=INK2)
    g = t[t.policy == "oracle"]
    if not g.empty:
        ax.scatter(g[xcol], g[ycol], s=70, color="#008300", marker="*", zorder=5, edgecolor="white", linewidth=0.6)
        ax.annotate("oracle (minimal set)", (float(g[xcol].iloc[0]), float(g[ycol].iloc[0])), xytext=(6, -10), textcoords="offset points", fontsize=8, color="#008300")
    ax.axhline(1.0, color=GRID, lw=0.9); ax.annotate("tolerance", (ax.get_xlim()[0], 1.0), xytext=(4, 3), textcoords="offset points", fontsize=7.5, color=MUTED)
    ax.set_xscale("log"); ax.set_yscale("log")
    ax.set_xlabel("mean total compute / uniform-fine compute"); ax.set_ylabel("mean error / tolerance (hidden truth)")
    ax.set_title(title, fontsize=10, loc="left")
    ax.legend(handles=handles, fontsize=7, frameon=False, loc="center left", bbox_to_anchor=(1.01, 0.5))
    _save(fig, path)


def target_dependence(matrix: dict, channels: list[str], path):
    """matrix: {(family, target): {channel: fraction necessary}} -> heat map per family."""
    fams = sorted({k[0] for k in matrix}); tgts = sorted({k[1] for k in matrix})
    fig, axes = plt.subplots(1, len(fams), figsize=(3.2 * len(fams) + 1.5, 0.45 * len(tgts) + 1.6), sharey=True, squeeze=False)
    cmap = matplotlib.colors.LinearSegmentedColormap.from_list("blue", ["#fcfcfb"] + SEQ_BLUE[1:])
    for ax, fam in zip(axes[0], fams):
        M = np.array([[matrix.get((fam, t), {}).get(c, np.nan) for c in channels] for t in tgts])
        im = ax.imshow(M, cmap=cmap, vmin=0, vmax=1, aspect="auto")
        ax.set_xticks(range(len(channels))); ax.set_xticklabels(channels, fontsize=8)
        ax.set_yticks(range(len(tgts))); ax.set_yticklabels(tgts, fontsize=8)
        ax.set_title(fam, fontsize=9, loc="left")
        for i in range(len(tgts)):
            for j in range(len(channels)):
                if np.isfinite(M[i, j]):
                    ax.text(j, i, f"{M[i,j]:.2f}", ha="center", va="center", fontsize=7, color=INK if M[i, j] < 0.6 else "white")
    fig.colorbar(im, ax=axes[0].tolist(), fraction=0.02, pad=0.02, label="fraction of episodes in which the channel needs fine physics")
    fig.suptitle("Which physics matters depends on the target (rows) and the intervention family (panels)", fontsize=10, x=0.01, ha="left")
    _save(fig, path)


def detector_bars(det: dict, path):
    """det: {detector: {family: metrics}} -> AUROC and false_safe_rate per family."""
    dets = list(det.keys()); fams = sorted({f for d in det.values() for f in d})
    fig, axes = plt.subplots(1, 2, figsize=(10, 3.6))
    cols = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"]
    for ax, key, lab in zip(axes, ("auroc", "false_safe_rate"), ("OOD detection AUROC (in-distribution vs shifted)", "false-safe rate: 'safe' declared when fine physics was necessary")):
        _style_axes(ax); w = 0.8 / len(dets)
        for i, d in enumerate(dets):
            vals = [det[d].get(f, {}).get(key, np.nan) for f in fams]
            ax.bar(np.arange(len(fams)) + (i - len(dets) / 2 + 0.5) * w, vals, width=w * 0.92, color=cols[i % len(cols)], label=d)
        ax.set_xticks(range(len(fams))); ax.set_xticklabels(fams, fontsize=8, rotation=20); ax.set_title(lab, fontsize=9, loc="left")
        ax.set_ylim(0, 1.02)
    axes[0].legend(fontsize=7, frameon=False)
    fig.tight_layout(); _save(fig, path)
