import matplotlib

matplotlib.use("Agg")  # draw to a file, no window needed
import matplotlib.pyplot as plt
import numpy as np
import shap

from main import extract_features, heuristic_score, preprocess_hinglish

CASE = (
    "The petitioner filed a writ petition before the High Court under Article 32 "
    "challenging the constitutional validity of Section 302 IPC in a murder case. "
    "The prosecution presented 6 witnesses including two eyewitnesses. "
    "The accused was charged along with 2 co-accused persons."
)

NAMES = [
    "witness_count",
    "citation_count",
    "statutory_depth",
    "ipc_sections",
    "accused_count",
    "high_risk_flags",
]


def to_row(f):
    return [
        f["witness_count"],
        f["citation_count"],
        f["statutory_depth"],
        len(f["ipc_sections"]),
        f["accused_count"],
        f["high_risk_flags"],
    ]


def to_features(row):
    return {
        "witness_count": row[0],
        "citation_count": row[1],
        "statutory_depth": row[2],
        "ipc_sections": ["x"] * int(round(row[3])),
        "accused_count": row[4],
        "hearing_count": 0,
        "high_risk_flags": row[5],
    }


def model_fn(X):
    return np.array([heuristic_score(to_features(r)) for r in X])


feats = extract_features(preprocess_hinglish(CASE))
x = np.array([to_row(feats)], dtype=float)

background = np.array(
    [
        [0, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 0],
        [3, 2, 2, 1, 2, 0],
        [6, 4, 4, 2, 3, 1],
    ],
    dtype=float,
)

explainer = shap.KernelExplainer(model_fn, background)
values = np.array(explainer.shap_values(x)).reshape(-1)
base = float(np.ravel(explainer.expected_value)[0])

print("Score for this case:", model_fn(x)[0])
print("Base value:", round(base, 2))
for name, val, v in zip(NAMES, values, x[0]):
    print(f"{name:16s} value={v:<5} SHAP={val:+.2f}")

explanation = shap.Explanation(
    values=values, base_values=base, data=x[0], feature_names=NAMES
)
shap.plots.waterfall(explanation, show=False)
plt.savefig("shap_explanation.png", bbox_inches="tight", dpi=150)
print("Saved shap_explanation.png")