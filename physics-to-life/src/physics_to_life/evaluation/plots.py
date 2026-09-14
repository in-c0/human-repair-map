"""Publication figures for the adaptive-fidelity experiments.

Style follows a fixed, validated categorical palette (colour follows the policy family and
never its rank; thin marks; hairline solid grid; one axis per panel; legend always present
for >= 2 series).  Every figure is written as PNG (and PDF for the paper).
"""
from __future__ import annotations

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import networkx as nx

INK = "#0b0b0b"; INK2 = "#52514e"; MUTED = "#898781"; GRID = "#e1e0d9"; AXIS = "#c3c2b7"; SURFACE = "#fcfcfb"
SEQ_BLUE = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"]

# colour follows the policy family (fixed slots), line style distinguishes one-shot / sequential
FAMILY_STYLE = {
    "learned":       dict(color="#2a78d6", ls="-",  marker="o", label="F  learned (one-shot)"),
    "learned_seq":   dict(color="#2a78d6", ls="--", marker="o", label="Fs learned (sequential)"),
    "physics":       dict(color="#eb6834", ls="-",  marker="s", label="E2 physics heuristic"),
    "physics_seq":   dict(color="#eb6834", ls="--", marker="s", label="E2s physics heuristic (seq.)"),
    "adjoint":       dict(color="#1baf7a", ls="-",  marker="D", label="E3 adjoint heuristic"),
    "spatial":       dict(color="#eda100", ls="-",  marker="^", label="E1 spatial heuristic"),
    "random":        dict(color="#e87ba4", ls="-",  marker="v", label="D  random"),
    "random_structured": dict(color="#e87ba4", ls="--", marker="v", label="D' random (ancestors of r)"),
    "oracle":        dict(color="#4a3aa7", ls=":",  marker="*", label="O  oracle (hidden truth)"),
}
UNIFORM_LABEL = {"uniform_coarse": "A coarse", "uniform_medium": "B medium", "uniform_fine": "C fine"}


def _style_axes(ax):
    ax.set_facecolor(SURFACE)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(AXIS); ax.spines[side].set_linewidth(0.8)
    ax.grid(True, color=GRID, linewidth=0.6, linestyle="-")
    ax.set_axisbelow(True)
    ax.tick_params(colors=INK2, labelsize=8, length=3, color=AXIS)
    ax.xaxis.label.set_color(INK2); ax.yaxis.label.set_color(INK2)
    ax.title.set_color(INK)


def _save(fig, path):
    fig.savefig(str(path) + ".png", dpi=170, bbox_inches="tight", facecolor="white")
    fig.savefig(str(path) + ".pdf", bbox_inches="tight", facecolor="white")
    plt.close(fig)


def pareto_plot(tab, family, path, cost_col="cost_mean", err_col="err_mean", lo_col="err_lo", hi_col="err_hi",
                title=None, policies=None, tol_ref=None, xlabel="mean total compute (nominal units)"):
    t = tab[tab.family == family]
    fig, ax = plt.subplots(figsize=(7.2, 4.6))
    _style_axes(ax)
    handles = []
    families = policies or [p for p in FAMILY_STYLE if p in set(t.policy)]
    for pol in families:
        st = FAMILY_STYLE[pol]
        g = t[t.policy == pol].sort_values(cost_col)
        if g.empty:
            continue
        ax.plot(g[cost_col], g[err_col], color=st["color"], ls=st["ls"], lw=1.6, marker=st["marker"], ms=4.5,
                mec="white", mew=0.6, zorder=3)
        if lo_col in g:
            yerr = np.vstack([np.maximum(g[err_col] - g[lo_col], 0), np.maximum(g[hi_col] - g[err_col], 0)])
            ax.errorbar(g[cost_col], g[err_col], yerr=yerr, fmt="none", ecolor=st["color"], elinewidth=0.7,
                        alpha=0.55, capsize=0, zorder=2)
        handles.append(Line2D([], [], color=st["color"], ls=st["ls"], marker=st["marker"], ms=5, lw=1.6, label=st["label"]))
    for pol, lab in UNIFORM_LABEL.items():
        g = t[t.policy == pol]
        if g.empty:
            continue
        x, y = float(g[cost_col].iloc[0]), float(g[err_col].iloc[0])
        ax.scatter([x], [y], s=46, color=MUTED, zorder=4, edgecolor="white", linewidth=0.8)
        ax.annotate(lab, (x, y), xytext=(6, 4), textcoords="offset points", fontsize=8, color=INK2)
        if pol == "uniform_fine":
            ax.axvline(x, color=GRID, lw=0.8, zorder=1)
    if tol_ref is not None:
        ax.axhline(tol_ref, color=AXIS, lw=0.8, ls="-")
        ax.annotate(f"tolerance {tol_ref:g}", (ax.get_xlim()[0], tol_ref), xytext=(4, 3), textcoords="offset points",
                    fontsize=7.5, color=MUTED)
    ax.set_xscale("log"); ax.set_yscale("log")
    ax.set_xlabel(xlabel); ax.set_ylabel("mean |Ŷ − Y*|  (intervention effect, hidden truth)")
    ax.set_title(title or f"Accuracy vs compute — family '{family}'", fontsize=10, loc="left")
    ax.legend(handles=handles, fontsize=7.5, frameon=False, loc="center left", bbox_to_anchor=(1.01, 0.5), ncol=1)
    _save(fig, path)


def calibration_plot(curves: dict, std_hists: dict, path, eces: dict):
    """curves: name -> (conf, acc, cnt) ; std_hists: family -> array of ensemble std values."""
    fig, axes = plt.subplots(1, 2, figsize=(9.2, 4.0))
    ax = axes[0]; _style_axes(ax)
    ax.plot([0, 1], [0, 1], color=AXIS, lw=0.8)
    cols = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]
    for (name, (conf, acc, cnt)), col in zip(curves.items(), cols):
        m = cnt >= 10  # bins with fewer than 10 nodes are not shown
        ax.plot(conf[m], acc[m], color=col, lw=1.6, marker="o", ms=4, mec="white", mew=0.6,
                label=f"{name} (ECE {eces[name]:.3f})")
        ax.scatter(conf[m], acc[m], s=np.clip(cnt[m] / max(cnt.max(), 1) * 120, 8, 120), color=col, alpha=0.35, lw=0)
    ax.set_xlabel("predicted P(node in minimal refinement set)")
    ax.set_ylabel("observed frequency"); ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.set_title("Reliability of routing probabilities", fontsize=10, loc="left")
    ax.legend(fontsize=7.5, frameon=False, loc="upper left")
    ax = axes[1]; _style_axes(ax)
    bins = np.linspace(0, 0.5, 26)
    for (fam, s), col in zip(std_hists.items(), ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#4a3aa7"]):
        ax.hist(s, bins=bins, histtype="step", lw=1.4, color=col, density=True, label=fam)
    ax.set_xlabel("ensemble disagreement (std of member probabilities)"); ax.set_ylabel("density")
    ax.set_title("Model uncertainty in- vs out-of-distribution", fontsize=10, loc="left")
    ax.legend(fontsize=7.5, frameon=False)
    fig.tight_layout(w_pad=3.0)
    _save(fig, path)


def _spread_layout(G, min_dist=0.22, iters=60):
    """Kamada-Kawai layout followed by a short repulsion pass so no two nodes overlap."""
    pos = nx.kamada_kawai_layout(G)
    keys = list(pos.keys())
    P = np.array([pos[k] for k in keys])
    for _ in range(iters):
        moved = False
        for i in range(len(P)):
            for j in range(i + 1, len(P)):
                d = P[j] - P[i]; dist = np.linalg.norm(d)
                if dist < min_dist:
                    push = (min_dist - dist) / 2 * (d / dist if dist > 1e-9 else np.array([1.0, 0.0]))
                    P[i] -= push; P[j] += push; moved = True
        if not moved:
            break
    return {k: P[i] for i, k in enumerate(keys)}


def refinement_location_plot(examples: list[dict], path):
    """examples: list of dicts with keys spec, interv, necessary, flips, panels={name: fidelity}, errs={name: err},
    costs={name: cost}."""
    n = len(examples)
    panel_names = list(examples[0]["panels"].keys())
    fig, axes = plt.subplots(n, len(panel_names) + 1, figsize=(3.0 * (len(panel_names) + 1), 2.9 * n))
    axes = np.atleast_2d(axes)
    for i, ex in enumerate(examples):
        spec = ex["spec"]; K = spec.K
        G = nx.DiGraph()
        G.add_nodes_from(range(K))
        for k in range(K):
            for j in range(K):
                if spec.W[k, j] != 0:
                    G.add_edge(j, k, w=spec.W[k, j])
        pos = _spread_layout(G)
        panels = [("hidden truth", None)] + [(name, ex["panels"][name]) for name in panel_names]
        for jdx, (name, fid) in enumerate(panels):
            ax = axes[i, jdx]; ax.set_facecolor(SURFACE); ax.set_xticks([]); ax.set_yticks([])
            for side in ax.spines.values():
                side.set_color(GRID)
            nx.draw_networkx_edges(G, pos, ax=ax, edge_color=AXIS, arrows=True, arrowsize=7, width=0.7,
                                   connectionstyle="arc3,rad=0.08", node_size=180)
            if fid is None:
                fill = ["#2a78d6" if ex["necessary"][k] else ("#9ec5f4" if ex["flips"][k] else "white") for k in range(K)]
            else:
                fill = ["#2a78d6" if fid[k] == 2 else "white" for k in range(K)]
            ring = [INK if ex["necessary"][k] else AXIS for k in range(K)]
            nx.draw_networkx_nodes(G, pos, ax=ax, node_color=fill, edgecolors=ring, linewidths=[1.6 if ex["necessary"][k] else 0.8 for k in range(K)], node_size=180)
            r = spec.readout
            ax.annotate("r", pos[r], xytext=(0, 9), textcoords="offset points", ha="center", fontsize=8, color=INK, fontweight="bold")
            for nn in ex["interv"].nodes:
                ax.annotate("u", pos[nn], xytext=(0, -13), textcoords="offset points", ha="center", fontsize=8, color="#eb6834", fontweight="bold")
            if fid is None:
                ttl = f"truth: {int(ex['necessary'].sum())} necessary, {int(ex['flips'].sum())} switched"
            else:
                ttl = f"{name}: |err| {ex['errs'][name]:.3f}, cost {ex['costs'][name]:.0f}"
            ax.set_title(ttl, fontsize=8, color=INK, loc="left")
    handles = [Line2D([], [], marker="o", ls="", mfc="#2a78d6", mec=INK, ms=8, label="necessary (truth) / refined (policy)"),
               Line2D([], [], marker="o", ls="", mfc="#9ec5f4", mec=AXIS, ms=8, label="switched but irrelevant to r"),
               Line2D([], [], marker="o", ls="", mfc="white", mec=INK, ms=8, mew=1.6, label="ring: necessary node")]
    fig.legend(handles=handles, loc="lower center", ncol=3, fontsize=8, frameon=False, bbox_to_anchor=(0.5, -0.01))
    fig.suptitle("Where was fine physics spent?  u = intervened node, r = readout", fontsize=10, x=0.01, ha="left")
    fig.tight_layout(rect=(0, 0.03, 1, 0.97))
    _save(fig, path)


def ood_plot(summary_rows: list[dict], path, metric="err_at_budget", budget_label=""):
    """Dot plot: one row per OOD family, policies as coloured markers."""
    fams = [r["family"] for r in summary_rows]
    pols = [p for p in ["learned", "learned_seq", "physics", "physics_seq", "adjoint", "random", "oracle"] if p in summary_rows[0]["values"]]
    fig, ax = plt.subplots(figsize=(7.6, 0.55 * len(fams) + 1.6))
    _style_axes(ax)
    ys = np.arange(len(fams))[::-1]
    for pol in pols:
        st = FAMILY_STYLE[pol]
        vals = [r["values"].get(pol, np.nan) for r in summary_rows]
        ax.scatter(vals, ys, color=st["color"], marker=st["marker"], s=34, zorder=3,
                   facecolors=st["color"] if st["ls"] == "-" else "white", edgecolors=st["color"], linewidths=1.2,
                   label=st["label"])
    for r, y in zip(summary_rows, ys):
        ax.scatter([r["values"].get("uniform_fine", np.nan)], [y], color=MUTED, marker="|", s=90, zorder=2)
    ax.set_yticks(ys); ax.set_yticklabels(fams, fontsize=8, color=INK)
    ax.set_xscale("log")
    ax.set_xlabel(f"mean |Ŷ − Y*| at compute budget {budget_label}  (grey tick: uniform fine)")
    ax.set_title("Out-of-distribution intervention families", fontsize=10, loc="left")
    ax.legend(fontsize=7, frameon=False, loc="center left", bbox_to_anchor=(1.01, 0.5))
    _save(fig, path)


def ablation_plot(rows: list[dict], path, metric_keys: list[str], metric_labels: list[str]):
    names = [r["name"] for r in rows]
    fig, axes = plt.subplots(1, len(metric_keys), figsize=(3.4 * len(metric_keys), 0.42 * len(names) + 1.4), sharey=True)
    axes = np.atleast_1d(axes)
    ys = np.arange(len(names))[::-1]
    for ax, key, lab in zip(axes, metric_keys, metric_labels):
        _style_axes(ax)
        vals = [r.get(key, np.nan) for r in rows]
        cols = ["#2a78d6" if r["name"].startswith("learned") else "#6da7ec" for r in rows]
        ax.scatter(vals, ys, color=cols, s=36, zorder=3, edgecolors="white", linewidths=0.6)
        ax.set_xlabel(lab, fontsize=8)
    axes[0].set_yticks(ys); axes[0].set_yticklabels(names, fontsize=8, color=INK)
    fig.suptitle("Ablations of the learned router", fontsize=10, x=0.01, ha="left")
    fig.tight_layout()
    _save(fig, path)


def curve_difference_plot(diffs: dict, path, cost_ref: dict):
    """diffs: label -> dict(cost_grid, mean, lo, hi) of err_a - err_b (negative: learned better)."""
    fig, ax = plt.subplots(figsize=(6.8, 3.9))
    _style_axes(ax)
    ax.axhline(0, color=AXIS, lw=0.8)
    cols = ["#2a78d6", "#eb6834", "#1baf7a", "#4a3aa7"]
    for (lab, d), col in zip(diffs.items(), cols):
        ax.plot(d["cost_grid"], d["mean"], color=col, lw=1.6, marker="o", ms=4, mec="white", mew=0.6, label=lab)
        ax.fill_between(d["cost_grid"], d["lo"], d["hi"], color=col, alpha=0.12, lw=0)
    for name, c in cost_ref.items():
        ax.axvline(c, color=GRID, lw=0.8)
        ax.annotate(name, (c, ax.get_ylim()[0]), xytext=(2, 4), textcoords="offset points", fontsize=7, color=MUTED)
    ax.set_xlabel("compute budget (nominal units)"); ax.set_ylabel("Δ mean error at matched budget\n(learned − comparator; < 0 favours learned)")
    ax.set_title("Paired bootstrap of frontier differences (95% CI)", fontsize=10, loc="left")
    ax.legend(fontsize=7.5, frameon=False)
    _save(fig, path)


def minimal_set_plot(sizes_by_family: dict, path):
    fams = list(sizes_by_family.keys())
    fig, ax = plt.subplots(figsize=(6.8, 3.6))
    _style_axes(ax)
    maxs = max(int(np.max(v)) for v in sizes_by_family.values() if len(v)) + 1
    width = 0.8 / len(fams)
    for i, fam in enumerate(fams):
        v = np.asarray(sizes_by_family[fam])
        counts = np.array([(v == s).mean() for s in range(maxs + 1)])
        col = SEQ_BLUE[min(len(SEQ_BLUE) - 1, 1 + i)] if fam != "id" else "#2a78d6"
        ax.bar(np.arange(maxs + 1) + (i - len(fams) / 2 + 0.5) * width, counts, width=width * 0.92, color=col, label=fam)
    ax.set_xlabel("size of the minimal refinement set (nodes needing fine physics)"); ax.set_ylabel("fraction of episodes")
    ax.set_title("Sparsity of physical importance (H4)", fontsize=10, loc="left")
    ax.legend(fontsize=7.5, frameon=False, ncol=2)
    _save(fig, path)


def trajectory_example_plot(ex: dict, path):
    """Time courses for one episode: readout node under each fidelity, plus the switching node's fast variable."""
    fig, axes = plt.subplots(1, 2, figsize=(9.0, 3.4))
    ax = axes[0]; _style_axes(ax)
    t = ex["t"]
    for name, X, col in zip(["reference (hidden truth)", "uniform fine", "uniform medium", "uniform coarse"],
                            [ex["x_ref"], ex["x_fine"], ex["x_med"], ex["x_coarse"]], [INK, "#2a78d6", "#eb6834", "#eda100"]):
        ax.plot(t, X[:, ex["readout"]], color=col, lw=1.4 if name.startswith("ref") else 1.2, label=name,
                ls="-" if not name.startswith("ref") else "-", alpha=0.9)
    ax.axvspan(ex["t_on"], ex["t_off"], color=GRID, alpha=0.6, lw=0)
    ax.set_xlabel("time"); ax.set_ylabel("readout x_r(t)"); ax.set_title("Readout under each fidelity (shaded: intervention)", fontsize=9, loc="left")
    ax.legend(fontsize=7, frameon=False)
    ax = axes[1]; _style_axes(ax)
    for k, col in zip(ex["nodes"], ["#2a78d6", "#eb6834", "#1baf7a"]):
        ax.plot(t, ex["y_ref"][:, k], color=col, lw=1.3, label=f"node {k} fast variable y_k (truth)")
        ax.plot(t, ex["y_med"][:, k], color=col, lw=1.0, ls="--", alpha=0.8)
    ax.set_xlabel("time"); ax.set_ylabel("y_k"); ax.set_title("Hidden fast variables: truth (solid) vs quasi-static closure (dashed)", fontsize=9, loc="left")
    ax.legend(fontsize=7, frameon=False)
    fig.tight_layout()
    _save(fig, path)
