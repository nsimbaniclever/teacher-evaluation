const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000/avaliar"
    : "/avaliar";

/* ============================================ */
/* ANIMAÇÃO DE FUNDO                             */
/* ============================================ */
(function iniciarFundoAnimado() {
    const canvas = document.getElementById("canvas-fundo");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    resize();
    window.addEventListener("resize", resize);

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789∫∑π√∞±≠≈";
    const particles = [];
    const numParticles = 90;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.3 - Math.random() * 0.7,
            char: chars[Math.floor(Math.random() * chars.length)],
            size: 14 + Math.random() * 20,
            alpha: 0.04 + Math.random() * 0.08,
            phase: Math.random() * Math.PI * 2,
        });
    }

    const draw = () => {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 180) {
                    const opacity = 0.12 * (1 - dist / 180);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = "#2557d0";
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = 0.4 + 0.6 * (1 - dist / 180);
                    ctx.stroke();
                }
            }
        }

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.phase += 0.02;

            if (p.y < -50) {
                p.y = height + 50;
                p.x = Math.random() * width;
            }
            if (p.x < -50) p.x = width + 50;
            if (p.x > width + 50) p.x = -50;

            const pulse = 1 + 0.3 * Math.sin(p.phase);

            ctx.globalAlpha = p.alpha * pulse;
            ctx.font = `bold ${p.size}px 'Courier New', monospace`;
            ctx.fillStyle = "#2557d0";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.char, p.x, p.y);
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    };

    draw();
})();

/* ============================================ */
/* SÍMBOLOS FLUTUANTES                           */
/* ============================================ */
(function iniciarSimbolos() {
    const container = document.getElementById("simbolos-flutuantes");
    if (!container) return;

    const symbols = [
        "📚", "✏️", "🎓", "🏫", "📖", "✍️", "📝", "🧮",
        "🔬", "🧪", "🎨", "🎭", "🎵", "🏆", "🥇", "🌟",
        "∫", "∑", "π", "√", "∞", "±", "≠", "≈"
    ];

    symbols.forEach((symbol) => {
        const span = document.createElement("span");
        span.textContent = symbol;
        span.style.left = `${2 + Math.random() * 96}%`;
        span.style.fontSize = `${22 + Math.random() * 40}px`;
        span.style.animation = `
            flutuar-${Math.floor(Math.random() * 3)} 
            ${12 + Math.random() * 10}s 
            linear 
            ${Math.random() * 8}s 
            infinite
        `;
        container.appendChild(span);
    });

    if (!document.getElementById("keyframes-flutuar")) {
        const style = document.createElement("style");
        style.id = "keyframes-flutuar";
        style.textContent = `
            @keyframes flutuar-0 {
                0% { transform: translateY(110vh) rotate(0deg) scale(0.5); opacity: 0; }
                10% { opacity: 0.07; }
                50% { transform: translateY(50vh) rotate(180deg) scale(1.2); }
                90% { opacity: 0.07; }
                100% { transform: translateY(-10vh) rotate(360deg) scale(0.5); opacity: 0; }
            }
            @keyframes flutuar-1 {
                0% { transform: translateY(110vh) translateX(0) rotate(0deg) scale(0.6); opacity: 0; }
                10% { opacity: 0.07; }
                50% { transform: translateY(50vh) translateX(60px) rotate(-180deg) scale(1.3); }
                90% { opacity: 0.07; }
                100% { transform: translateY(-10vh) translateX(0) rotate(-360deg) scale(0.6); opacity: 0; }
            }
            @keyframes flutuar-2 {
                0% { transform: translateY(110vh) translateX(0) rotate(0deg) scale(0.7); opacity: 0; }
                10% { opacity: 0.07; }
                50% { transform: translateY(50vh) translateX(-60px) rotate(180deg) scale(1.4); }
                90% { opacity: 0.07; }
                100% { transform: translateY(-10vh) translateX(0) rotate(360deg) scale(0.7); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
})();

/* ============================================ */
/* ELEMENTOS                                     */
/* ============================================ */
const inputFicheiro = document.getElementById("ficheiro");
const btnAvaliar = document.getElementById("btn-avaliar");
const loading = document.getElementById("loading");
const erro = document.getElementById("erro");
const erroMensagem = document.getElementById("erro-mensagem");
const resultados = document.getElementById("resultados");
const resumo = document.getElementById("resumo");
const tabelaMedidas = document.querySelector("#tabela-medidas tbody");
const decisaoBox = document.getElementById("decisao-box");
const decisaoTitulo = document.getElementById("decisao-titulo");
const decisaoId = document.getElementById("decisao-id");
const decisaoJustificacao = document.getElementById("decisao-justificacao");
const resumoCondicoes = document.getElementById("resumo-condicoes");

let ficheiroSelecionado = null;
let config = null;

/* ============================================ */
/* CARREGAR CONFIGURAÇÃO                         */
/* ============================================ */
window.addEventListener("load", () => {
    const configGuardada = localStorage.getItem("config");
    if (configGuardada) {
        config = JSON.parse(configGuardada);
        mostrarResumoCondicoes(config);
    } else {
        resumoCondicoes.innerHTML = "<p>⚠️ Nenhuma condição definida. <a href='index.html'>Definir condições</a></p>";
    }
});

function mostrarResumoCondicoes(c) {
    resumoCondicoes.innerHTML = `
        <p><strong>Escala:</strong> 0-${c.escala}</p>
        <p><strong>Média mínima:</strong> ${c.mediaMin}</p>
        <p><strong>Mediana mínima:</strong> ${c.medianaMin}</p>
        <p><strong>Taxa de aprovação:</strong> ${c.taxaAprovacao}%</p>
        <p><strong>Amplitude máxima:</strong> ${c.amplitudeMax}</p>
        <p><strong>IQR máximo:</strong> ${c.iqrMax}</p>
        <p><strong>Desvio padrão máximo:</strong> ${c.desvioMax}</p>
        <p><strong>CV máximo:</strong> ${c.cvMax}%</p>
        <p><strong>Assimetria máxima:</strong> ${c.assimetriaMax}</p>
        <p><strong>Curtose máxima:</strong> ${c.curtoseMax}</p>
        <p><strong>Outliers máximos:</strong> ${c.outliersMax}</p>
        <p><strong>ID para manter:</strong> ≥ ${c.idManter}</p>
        <p><strong>ID para plano:</strong> ≥ ${c.idPlano}</p>
        <p><strong>ID para demitir:</strong> &lt; ${c.idDemitir}</p>
    `;
}

/* ============================================ */
/* MOSTRAR NOME DO FICHEIRO                      */
/* ============================================ */
inputFicheiro.addEventListener("change", (e) => {
    ficheiroSelecionado = e.target.files[0];

    const nomeFicheiro = document.getElementById("nome-ficheiro");

    if (ficheiroSelecionado) {
        nomeFicheiro.textContent = `📄 ${ficheiroSelecionado.name}`;
        nomeFicheiro.classList.add("ativo");
    } else {
        nomeFicheiro.textContent = "Nenhum ficheiro selecionado";
        nomeFicheiro.classList.remove("ativo");
    }
});

/* ============================================ */
/* ENVIAR PARA O BACKEND                         */
/* ============================================ */
btnAvaliar.addEventListener("click", async () => {
    if (!ficheiroSelecionado) {
        mostrarErro("Por favor, selecione um ficheiro Excel.");
        return;
    }

    if (!config) {
        mostrarErro("Nenhuma condição definida. Volte à página de configuração.");
        return;
    }

    esconderTudo();
    loading.classList.remove("hidden");
    btnAvaliar.disabled = true;

    const formData = new FormData();
    formData.append("ficheiro", ficheiroSelecionado);
    formData.append("config", JSON.stringify(config));

    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            body: formData,
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarErro(dados.erro || "Erro ao processar o ficheiro.");
            return;
        }

        mostrarResultados(dados);
    } catch (err) {
        mostrarErro("Erro de ligação ao servidor: " + err.message);
    } finally {
        loading.classList.add("hidden");
        btnAvaliar.disabled = false;
    }
});

/* ============================================ */
/* MOSTRAR RESULTADOS                            */
/* ============================================ */
function mostrarResultados(d) {
    resultados.classList.remove("hidden");
    mostrarDecisao(d);

    resumo.innerHTML = `
        <p><strong>Número de alunos:</strong> ${d.n}</p>
        <p><strong>Média:</strong> ${d.media} — ${interpretarMedia(d.media, d.config.mediaMin)}</p>
        <p><strong>Mediana:</strong> ${d.mediana} — ${interpretarMediana(d.media, d.mediana)}</p>
        <p><strong>Moda:</strong> ${d.modas.join(", ")} (${d.tipo_moda}) — ${interpretarModa(d.tipo_moda)}</p>
        <p><strong>Amplitude:</strong> ${d.amplitude} — ${interpretarAmplitude(d.amplitude, d.config.amplitudeMax)}</p>
        <p><strong>IQR:</strong> ${d.iqr} — ${interpretarIQR(d.iqr, d.config.iqrMax)}</p>
        <p><strong>Desvio Padrão:</strong> ${d.desvio} — ${interpretarDesvio(d.desvio, d.config.desvioMax)}</p>
        <p><strong>CV:</strong> ${d.cv}% — ${interpretarCV(d.cv, d.config.cvMax)}</p>
        <p><strong>Assimetria (Pearson):</strong> ${d.assimetria_pearson} — ${interpretarAssimetria(d.assimetria_pearson, d.config.assimetriaMax)}</p>
        <p><strong>Assimetria (Bowley):</strong> ${d.assimetria_bowley} — ${interpretarAssimetria(d.assimetria_bowley, d.config.assimetriaMax)}</p>
        <p><strong>Curtose:</strong> ${d.curtose} — ${interpretarCurtose(d.curtose, d.config.curtoseMax)}</p>
        <p><strong>Taxa de Aprovação:</strong> ${d.taxa_aprovacao}% (${d.aprovados}/${d.n}) — ${interpretarTaxa(d.taxa_aprovacao, d.config.taxaAprovacao)}</p>
        <p><strong>Outliers:</strong> ${d.outliers.length === 0 ? "Nenhum" : d.outliers.join(", ")}</p>
    `;

    tabelaMedidas.innerHTML = `
        <tr><td>Média</td><td>${d.media}</td><td>${interpretarMedia(d.media, d.config.mediaMin)}</td></tr>
        <tr><td>Mediana</td><td>${d.mediana}</td><td>${interpretarMediana(d.media, d.mediana)}</td></tr>
        <tr><td>Moda</td><td>${d.modas.join(", ")}</td><td>${interpretarModa(d.tipo_moda)}</td></tr>
        <tr><td>Amplitude</td><td>${d.amplitude}</td><td>${interpretarAmplitude(d.amplitude, d.config.amplitudeMax)}</td></tr>
        <tr><td>IQR</td><td>${d.iqr}</td><td>${interpretarIQR(d.iqr, d.config.iqrMax)}</td></tr>
        <tr><td>Desvio Padrão</td><td>${d.desvio}</td><td>${interpretarDesvio(d.desvio, d.config.desvioMax)}</td></tr>
        <tr><td>CV</td><td>${d.cv}%</td><td>${interpretarCV(d.cv, d.config.cvMax)}</td></tr>
        <tr><td>Assimetria (Pearson)</td><td>${d.assimetria_pearson}</td><td>${interpretarAssimetria(d.assimetria_pearson, d.config.assimetriaMax)}</td></tr>
        <tr><td>Assimetria (Bowley)</td><td>${d.assimetria_bowley}</td><td>${interpretarAssimetria(d.assimetria_bowley, d.config.assimetriaMax)}</td></tr>
        <tr><td>Curtose</td><td>${d.curtose}</td><td>${interpretarCurtose(d.curtose, d.config.curtoseMax)}</td></tr>
        <tr><td>Taxa de Aprovação</td><td>${d.taxa_aprovacao}%</td><td>${interpretarTaxa(d.taxa_aprovacao, d.config.taxaAprovacao)}</td></tr>
    `;

    desenharHistograma(d.histograma);
    desenharBoxplot(d.boxplot);
}

/* ============================================ */
/* DECISÃO                                       */
/* ============================================ */
function mostrarDecisao(d) {
    decisaoBox.classList.remove("manter", "plano", "demitir");

    decisaoTitulo.textContent = `Decisão: ${d.decisao}`;
    decisaoId.textContent = `Índice de Desempenho (ID): ${d.id} (${d.pontos} / ${d.total_pesos} pontos)`;

    if (d.id >= d.config.idManter) {
        decisaoBox.classList.add("manter");
        decisaoJustificacao.textContent = "O professor apresenta um desempenho excelente. Recomenda-se a manutenção.";
    } else if (d.id >= d.config.idPlano) {
        decisaoBox.classList.add("manter");
        decisaoJustificacao.textContent = "O professor apresenta um desempenho bom, mas com alguns pontos de atenção. Recomenda-se acompanhamento.";
    } else if (d.id >= d.config.idDemitir) {
        decisaoBox.classList.add("plano");
        decisaoJustificacao.textContent = "O professor apresenta um desempenho problemático. Recomenda-se um plano de melhoria com prazo curto.";
    } else {
        decisaoBox.classList.add("demitir");
        decisaoJustificacao.textContent = "O professor apresenta um desempenho crítico. Recomenda-se a demissão ou um plano de melhoria severo.";
    }
}

/* ============================================ */
/* INTERPRETAÇÕES                                */
/* ============================================ */
function interpretarMedia(m, min) {
    if (m >= min) return "✅ Dentro da meta.";
    if (m >= min - 0.5) return "⚠️ Próxima da meta.";
    return "❌ Abaixo da meta.";
}

function interpretarMediana(media, mediana) {
    const dif = Math.abs(media - mediana);
    if (dif < 0.5) return "✅ Distribuição simétrica (mediana ≈ média).";
    if (mediana > media) return "⚠️ Assimetria à esquerda — alunos fracos a puxar a média para baixo.";
    return "⚠️ Assimetria à direita — alunos muito bons a puxar a média para cima.";
}

function interpretarModa(tipo) {
    if (tipo === "unimodal") return "✅ Turma com uma nota típica.";
    if (tipo === "bimodal") return "⚠️ Turma dividida em 2 grupos.";
    return "❌ Turma dividida em vários grupos.";
}

function interpretarAmplitude(a, max) {
    if (a <= max) return "✅ Turma homogénea.";
    if (a <= max + 2) return "⚠️ Dispersão moderada.";
    return "❌ Turma heterogénea.";
}

function interpretarIQR(iqr, max) {
    if (iqr <= max) return "✅ Dispersão central baixa.";
    if (iqr <= max + 1) return "⚠️ Dispersão central moderada.";
    return "❌ Dispersão central elevada.";
}

function interpretarDesvio(d, max) {
    if (d <= max) return "✅ Baixa dispersão.";
    if (d <= max + 1) return "⚠️ Dispersão moderada.";
    return "❌ Dispersão elevada.";
}

function interpretarCV(cv, max) {
    if (cv <= max) return "✅ Baixo — turma homogénea.";
    if (cv <= max + 10) return "⚠️ Moderado — dispersão moderada.";
    return "❌ Alto — turma heterogénea.";
}

function interpretarAssimetria(a, max) {
    if (Math.abs(a) < max / 2) return "✅ Aproximadamente simétrica.";
    if (Math.abs(a) < max) return "⚠️ Ligeira assimetria.";
    if (a > 0) return "❌ Assimetria acentuada à direita.";
    return "❌ Assimetria acentuada à esquerda.";
}

function interpretarCurtose(k, max) {
    if (Math.abs(k) < max) return "✅ Mesocúrtica (normal).";
    if (k > 0) return "⚠️ Leptocúrtica (pico alto, caudas leves).";
    return "⚠️ Platicúrtica (pico baixo, caudas pesadas).";
}

function interpretarTaxa(t, min) {
    if (t >= min) return "✅ Taxa de aprovação dentro da meta.";
    if (t >= min - 10) return "⚠️ Taxa de aprovação próxima da meta.";
    return "❌ Taxa de aprovação abaixo da meta.";
}

/* ============================================ */
/* GRÁFICOS                                      */
/* ============================================ */
function desenharHistograma(h) {
    const trace = {
        x: h.labels,
        y: h.valores,
        type: "bar",
        marker: { color: "#2557d0" },
        name: "Distribuição",
    };

    const layout = {
        title: { text: "Histograma", font: { color: "#1a3f8a" } },
        paper_bgcolor: "rgba(255,255,255,0)",
        plot_bgcolor: "rgba(255,255,255,0)",
        font: { color: "#1a3f8a" },
        xaxis: { title: "Intervalo de notas", color: "#1a3f8a" },
        yaxis: { title: "Número de alunos", color: "#1a3f8a" },
    };

    Plotly.newPlot("histograma", [trace], layout, { responsive: true });
}

function desenharBoxplot(b) {
    const trace = {
        y: [b.min, b.q1, b.mediana, b.q3, b.max],
        type: "box",
        name: "Notas",
        marker: { color: "#2557d0" },
        boxpoints: false,
    };

    const layout = {
        title: { text: "Boxplot", font: { color: "#1a3f8a" } },
        paper_bgcolor: "rgba(255,255,255,0)",
        plot_bgcolor: "rgba(255,255,255,0)",
        font: { color: "#1a3f8a" },
        yaxis: { title: "Notas", color: "#1a3f8a" },
    };

    Plotly.newPlot("boxplot", [trace], layout, { responsive: true });
}

/* ============================================ */
/* UTILITÁRIOS                                   */
/* ============================================ */
function mostrarErro(msg) {
    erro.classList.remove("hidden");
    erroMensagem.textContent = msg;
}

function esconderTudo() {
    erro.classList.add("hidden");
    resultados.classList.add("hidden");
}