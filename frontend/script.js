/* ============================================ */
/* ANIMAÇÃO DE FUNDO — CANVAS NEURAL ESCOLAR     */
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

    let time = 0;

    const draw = () => {
        time++;
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
/* EXPLICAÇÕES DE AJUDA                          */
/* ============================================ */
const explicacoes = {
    "media-min": {
        titulo: "Média Mínima",
        texto: "A média é a soma de todas as notas dividida pelo número de alunos. É o valor que representa o 'centro' da turma. Se a média for inferior a este valor, significa que o desempenho global da turma está abaixo do esperado."
    },
    "mediana-min": {
        titulo: "Mediana Mínima",
        texto: "A mediana é o valor que divide a turma ao meio: 50% dos alunos têm nota abaixo, 50% têm nota acima. É mais robusta que a média."
    },
    "taxa-aprovacao": {
        titulo: "Taxa de Aprovação",
        texto: "Percentagem de alunos com nota igual ou superior a metade da escala (ex.: 5 numa escala de 0 a 10)."
    },
    "amplitude-max": {
        titulo: "Amplitude Máxima",
        texto: "A amplitude é a diferença entre a maior e a menor nota. Se for superior a este valor, a turma é heterogénea."
    },
    "iqr-max": {
        titulo: "IQR Máximo",
        texto: "O IQR (Amplitude Interquartil) é a diferença entre Q3 e Q1. Mede a dispersão dos 50% centrais dos dados."
    },
    "desvio-max": {
        titulo: "Desvio Padrão Máximo",
        texto: "O desvio padrão mede, em média, o quanto cada nota se afasta da média. Está na mesma unidade das notas."
    },
    "cv-max": {
        titulo: "CV Máximo (Coeficiente de Variação)",
        texto: "O CV é o desvio padrão expresso como percentagem da média. Valores típicos: ≤ 15% (baixo), 15-30% (moderado), > 30% (alto)."
    },
    "assimetria-max": {
        titulo: "Assimetria Máxima",
        texto: "A assimetria mede o grau de desvio de uma distribuição em relação à simetria. Valores: 0 (simétrica), > 0 (à direita), < 0 (à esquerda)."
    },
    "curtose-max": {
        titulo: "Curtose Máxima",
        texto: "A curtose mede o grau de 'pico' e o peso das caudas. Valores: 0 (mesocúrtica), > 0 (leptocúrtica), < 0 (platicúrtica)."
    },
    "outliers-max": {
        titulo: "Outliers Máximos",
        texto: "Outliers são valores atípicos. São detetados pela Regra de Tukey (Q1 − 1,5×IQR e Q3 + 1,5×IQR)."
    },
    "id-manter": {
        titulo: "ID Mínimo para Manter",
        texto: "O ID (Índice de Desempenho) varia entre −1 e +1. Se for igual ou superior a este valor, o professor é mantido."
    },
    "id-plano": {
        titulo: "ID Mínimo para Plano de Melhoria",
        texto: "Se o ID estiver entre este valor e o de 'manter', o professor entra em plano de melhoria."
    },
    "id-demitir": {
        titulo: "ID Mínimo para Demitir",
        texto: "Se o ID for inferior a este valor, o professor é demitido."
    }
};

/* ============================================ */
/* ABRIR MODAL DE AJUDA                          */
/* ============================================ */
document.querySelectorAll(".ajuda").forEach((el) => {
    el.addEventListener("click", () => {
        const chave = el.dataset.explicacao;
        const info = explicacoes[chave];
        if (info) {
            document.getElementById("modal-titulo").textContent = info.titulo;
            document.getElementById("modal-texto").textContent = info.texto;
            document.getElementById("modal-ajuda").classList.remove("hidden");
        }
    });
});

/* FECHAR MODAL */
const modalFechar = document.getElementById("modal-fechar");
if (modalFechar) {
    modalFechar.addEventListener("click", () => {
        document.getElementById("modal-ajuda").classList.add("hidden");
    });
}

const modalAjuda = document.getElementById("modal-ajuda");
if (modalAjuda) {
    modalAjuda.addEventListener("click", (e) => {
        if (e.target.id === "modal-ajuda") {
            document.getElementById("modal-ajuda").classList.add("hidden");
        }
    });
}

/* ============================================ */
/* ESCALA DE NOTAS                               */
/* ============================================ */
document.querySelectorAll('input[name="escala"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
        const max = parseFloat(e.target.value);
        const camposParaAtualizar = [
            "media-min",
            "mediana-min",
            "amplitude-max",
            "iqr-max",
            "desvio-max"
        ];

        camposParaAtualizar.forEach((id) => {
            const input = document.getElementById(id);
            if (input) {
                input.max = max;
                if (parseFloat(input.value) > max) {
                    input.value = max;
                }
            }
        });

        if (max === 5) {
            document.getElementById("media-min").value = 4;
            document.getElementById("mediana-min").value = 3.75;
        } else if (max === 10) {
            document.getElementById("media-min").value = 8;
            document.getElementById("mediana-min").value = 7.5;
        } else if (max === 20) {
            document.getElementById("media-min").value = 16;
            document.getElementById("mediana-min").value = 15;
        } else if (max === 100) {
            document.getElementById("media-min").value = 80;
            document.getElementById("mediana-min").value = 75;
        }
    });
});

/* ============================================ */
/* BOTÃO AVANÇAR                                 */
/* ============================================ */
const btnAvancar = document.getElementById("btn-avancar");
if (btnAvancar) {
    btnAvancar.addEventListener("click", () => {
        const escalaInput = document.querySelector('input[name="escala"]:checked');
        if (!escalaInput) {
            alert("Por favor, escolha uma escala de notas.");
            return;
        }

        const escala = parseFloat(escalaInput.value);

        const config = {
            escala: escala,
            mediaMin: parseFloat(document.getElementById("media-min").value),
            medianaMin: parseFloat(document.getElementById("mediana-min").value),
            taxaAprovacao: parseFloat(document.getElementById("taxa-aprovacao").value),
            amplitudeMax: parseFloat(document.getElementById("amplitude-max").value),
            iqrMax: parseFloat(document.getElementById("iqr-max").value),
            desvioMax: parseFloat(document.getElementById("desvio-max").value),
            cvMax: parseFloat(document.getElementById("cv-max").value),
            assimetriaMax: parseFloat(document.getElementById("assimetria-max").value),
            curtoseMax: parseFloat(document.getElementById("curtose-max").value),
            outliersMax: parseFloat(document.getElementById("outliers-max").value),
            idManter: parseFloat(document.getElementById("id-manter").value),
            idPlano: parseFloat(document.getElementById("id-plano").value),
            idDemitir: parseFloat(document.getElementById("id-demitir").value),
        };

        localStorage.setItem("config", JSON.stringify(config));
        window.location.href = "analise.html";
    });
}

/* ============================================ */
/* CARREGAR CONFIGURAÇÃO AO INICIAR              */
/* ============================================ */
window.addEventListener("load", () => {
    const configGuardada = localStorage.getItem("config");
    if (configGuardada) {
        const c = JSON.parse(configGuardada);

        const escalaInput = document.querySelector(`input[name="escala"][value="${c.escala}"]`);
        if (escalaInput) escalaInput.checked = true;

        const campos = [
            "media-min", "mediana-min", "taxa-aprovacao",
            "amplitude-max", "iqr-max", "desvio-max", "cv-max",
            "assimetria-max", "curtose-max", "outliers-max",
            "id-manter", "id-plano", "id-demitir"
        ];

        const chaves = [
            "mediaMin", "medianaMin", "taxaAprovacao",
            "amplitudeMax", "iqrMax", "desvioMax", "cvMax",
            "assimetriaMax", "curtoseMax", "outliersMax",
            "idManter", "idPlano", "idDemitir"
        ];

        campos.forEach((id, i) => {
            const input = document.getElementById(id);
            if (input && c[chaves[i]] !== undefined) {
                input.value = c[chaves[i]];
            }
        });
    }
});