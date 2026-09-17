from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy import stats
import json

app = Flask(__name__)
CORS(app)

# Configuração padrão (caso o frontend não envie nada)
CONFIG_PADRAO = {
    "escala": 10,
    "mediaMin": 8.0,
    "medianaMin": 7.5,
    "taxaAprovacao": 80,
    "amplitudeMax": 6,
    "iqrMax": 4,
    "desvioMax": 2,
    "cvMax": 30,
    "assimetriaMax": 0.5,
    "curtoseMax": 1.0,
    "outliersMax": 2,
    "idManter": 0.5,
    "idPlano": 0.0,
    "idDemitir": -0.5,
}

@app.route("/")
def home():
    return jsonify({"mensagem": "API de Avaliação de Professor está a funcionar!"})

@app.route("/avaliar", methods=["POST"])
def avaliar():
    # Verificar se o ficheiro foi enviado
    if "ficheiro" not in request.files:
        return jsonify({"erro": "Nenhum ficheiro enviado"}), 400

    ficheiro = request.files["ficheiro"]

    # Ler a configuração enviada pelo frontend
    config_str = request.form.get("config")
    if config_str:
        try:
            config = json.loads(config_str)
            # Preencher com valores padrão se faltar algum
            for chave, valor in CONFIG_PADRAO.items():
                if chave not in config:
                    config[chave] = valor
        except Exception:
            config = CONFIG_PADRAO
    else:
        config = CONFIG_PADRAO

    escala = config["escala"]

    # Ler o Excel
    try:
        df = pd.read_excel(ficheiro)
    except Exception as e:
        return jsonify({"erro": f"Erro ao ler o Excel: {str(e)}"}), 400

    # Verificar se a coluna "Nota" existe
    if "Nota" not in df.columns:
        return jsonify({"erro": "O Excel deve ter uma coluna chamada 'Nota'"}), 400

    # Extrair as notas
    notas = df["Nota"].dropna().values
    n = len(notas)

    if n == 0:
        return jsonify({"erro": "Nenhuma nota válida encontrada"}), 400

    # Medidas de tendência central
    media = float(np.mean(notas))
    mediana = float(np.median(notas))

    # Moda (pode ser múltipla)
    contagens = pd.Series(notas).value_counts()
    freq_max = contagens.max()
    modas = contagens[contagens == freq_max].index.tolist()
    n_modas = len(modas)

    if n_modas == 1:
        tipo_moda = "unimodal"
    elif n_modas == 2:
        tipo_moda = "bimodal"
    else:
        tipo_moda = "multimodal"

    # Medidas de dispersão
    amplitude = float(np.max(notas) - np.min(notas))
    q1 = float(np.percentile(notas, 25))
    q2 = float(np.percentile(notas, 50))
    q3 = float(np.percentile(notas, 75))
    iqr = float(q3 - q1)
    desvio = float(np.std(notas, ddof=1))
    cv = float((desvio / media) * 100) if media != 0 else 0

    # Assimetria e curtose
    as_pearson = float(stats.skew(notas, bias=False))
    curtose = float(stats.kurtosis(notas, bias=False))

    # Assimetria de Bowley
    if (q3 - q1) != 0:
        bowley = float(((q3 - q2) - (q2 - q1)) / (q3 - q1))
    else:
        bowley = 0

    # Outliers (Tukey)
    limite_inf = q1 - 1.5 * iqr
    limite_sup = q3 + 1.5 * iqr
    outliers = notas[(notas < limite_inf) | (notas > limite_sup)].tolist()

    # Taxa de aprovação (nota >= 10 numa escala de 0-10)
    # Ajustar conforme a escala
    nota_aprovacao = escala / 2  # 50% da escala (ex: 5 numa escala de 10)
    aprovados = int(np.sum(notas >= nota_aprovacao))
    taxa_aprovacao = float((aprovados / n) * 100) if n > 0 else 0

    # Histograma: distribuição por classes (ajustado à escala)
    num_classes = 5
    largura = escala / num_classes
    bins = [i * largura for i in range(num_classes + 1)]
    labels = [f"{bins[i]:.0f}-{bins[i+1]:.0f}" for i in range(num_classes)]

    histograma = []
    for i in range(num_classes):
        if i == num_classes - 1:
            contagem = int(np.sum((notas >= bins[i]) & (notas <= bins[i+1])))
        else:
            contagem = int(np.sum((notas >= bins[i]) & (notas < bins[i+1])))
        histograma.append(contagem)

    # Boxplot
    boxplot = {
        "min": float(np.min(notas)),
        "q1": q1,
        "mediana": q2,
        "q3": q3,
        "max": float(np.max(notas)),
        "outliers": outliers
    }

    # ==========================================
    # ÍNDICE DE DESEMPENHO (ID) — com pesos
    # ==========================================
    pesos = {
        "media": 2,
        "mediana": 3,
        "moda": 3,
        "amplitude": 4,
        "iqr": 3,
        "desvio": 3,
        "cv": 3,
        "assimetria": 3,
        "curtose": 3,
        "outliers": 2,
        "taxa_aprovacao": 4,
    }

    pontos = 0
    total_pesos = sum(pesos.values())

    # Média
    if media >= config["mediaMin"]:
        pontos += pesos["media"]
    elif media >= config["mediaMin"] - 0.5:
        pontos += 0
    else:
        pontos -= pesos["media"]

    # Mediana vs Média
    dif_med = abs(media - mediana)
    if dif_med < 0.5:
        pontos += pesos["mediana"]
    elif dif_med <= 1:
        pontos += 0
    else:
        pontos -= pesos["mediana"]

    # Moda
    if tipo_moda == "unimodal":
        pontos += pesos["moda"]
    elif tipo_moda == "bimodal":
        pontos += 0
    else:
        pontos -= pesos["moda"]

    # Amplitude
    if amplitude <= config["amplitudeMax"]:
        pontos += pesos["amplitude"]
    elif amplitude <= config["amplitudeMax"] + 2:
        pontos += 0
    else:
        pontos -= pesos["amplitude"]

    # IQR
    if iqr <= config["iqrMax"]:
        pontos += pesos["iqr"]
    elif iqr <= config["iqrMax"] + 1:
        pontos += 0
    else:
        pontos -= pesos["iqr"]

    # Desvio Padrão
    if desvio <= config["desvioMax"]:
        pontos += pesos["desvio"]
    elif desvio <= config["desvioMax"] + 1:
        pontos += 0
    else:
        pontos -= pesos["desvio"]

    # CV
    if cv <= config["cvMax"]:
        pontos += pesos["cv"]
    elif cv <= config["cvMax"] + 10:
        pontos += 0
    else:
        pontos -= pesos["cv"]

    # Assimetria (Bowley)
    if abs(bowley) < config["assimetriaMax"] / 2:
        pontos += pesos["assimetria"]
    elif abs(bowley) < config["assimetriaMax"]:
        pontos += 0
    else:
        pontos -= pesos["assimetria"]

    # Curtose
    if abs(curtose) < config["curtoseMax"]:
        pontos += pesos["curtose"]
    elif abs(curtose) < config["curtoseMax"] * 2:
        pontos += 0
    else:
        pontos -= pesos["curtose"]

    # Outliers
    if len(outliers) <= config["outliersMax"]:
        pontos += pesos["outliers"]
    elif len(outliers) <= config["outliersMax"] * 2:
        pontos += 0
    else:
        pontos -= pesos["outliers"]

    # Taxa de aprovação
    if taxa_aprovacao >= config["taxaAprovacao"]:
        pontos += pesos["taxa_aprovacao"]
    elif taxa_aprovacao >= config["taxaAprovacao"] - 10:
        pontos += 0
    else:
        pontos -= pesos["taxa_aprovacao"]

    # Índice final
    id_final = pontos / total_pesos if total_pesos != 0 else 0

    # Decisão com base nas condições do diretor
    if id_final >= config["idManter"]:
        decisao = "Manter"
    elif id_final >= config["idPlano"]:
        decisao = "Manter com acompanhamento"
    elif id_final >= config["idDemitir"]:
        decisao = "Plano de melhoria"
    else:
        decisao = "Demitir"

    # Resposta
    return jsonify({
        "n": n,
        "escala": escala,
        "media": round(media, 2),
        "mediana": round(mediana, 2),
        "modas": [round(m, 2) for m in modas],
        "tipo_moda": tipo_moda,
        "amplitude": round(amplitude, 2),
        "q1": round(q1, 2),
        "q2": round(q2, 2),
        "q3": round(q3, 2),
        "iqr": round(iqr, 2),
        "desvio": round(desvio, 2),
        "cv": round(cv, 2),
        "assimetria_pearson": round(as_pearson, 2),
        "assimetria_bowley": round(bowley, 2),
        "curtose": round(curtose, 2),
        "outliers": outliers,
        "taxa_aprovacao": round(taxa_aprovacao, 2),
        "aprovados": aprovados,
        "histograma": {
            "labels": labels,
            "valores": histograma
        },
        "boxplot": boxplot,
        "id": round(id_final, 2),
        "decisao": decisao,
        "pontos": pontos,
        "total_pesos": total_pesos,
        "config": config
    })

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)