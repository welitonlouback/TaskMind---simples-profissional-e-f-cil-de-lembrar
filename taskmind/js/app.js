lucide.createIcons();

// ================= DADOS =================

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

tarefas = tarefas.map(tarefa => {
  if (!tarefa.data) {
    tarefa.data = new Date().toISOString().split("T")[0];
  }
  return tarefa;
});

let diasSelecionados = [];

function salvarLocal() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// ================= MODAL =================

function abrirModal() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function fecharModal() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  limparModal();
}

function limparModal() {
  document.getElementById("tituloInput").value = "";
  document.getElementById("horarioInput").value = "";
  diasSelecionados = [];

  document.querySelectorAll(".dia-btn").forEach(btn => {
    btn.classList.remove("ativo");
  });
}

// ================= SELEÇÃO DE DIAS =================

function toggleDia(dia, elemento) {

  if (diasSelecionados.includes(dia)) {
    diasSelecionados = diasSelecionados.filter(d => d !== dia);
    elemento.classList.remove("ativo");
  } else {
    diasSelecionados.push(dia);
    elemento.classList.add("ativo");
  }
}

// ================= CRIAR HOJE =================

function adicionarTarefaHoje() {

  const titulo = document.getElementById("tituloInput").value;
  const prioridade = document.getElementById("prioridadeInput").value;
  const horario = document.getElementById("horarioInput").value;

  if (!titulo) return;

  tarefas.push({
    titulo,
    prioridade,
    concluida: false,
    data: new Date().toISOString().split("T")[0],
    horario: horario || null
  });

  salvarLocal();
  atualizarDashboard();
  renderizarTarefas();
  renderizarConcluidas();
  fecharModal();
}

// ================= RECORRÊNCIA MENSAL =================

function agendarNoMes() {

  const titulo = document.getElementById("tituloInput").value;
  const prioridade = document.getElementById("prioridadeInput").value;
  const horario = document.getElementById("horarioInput").value;

  if (!titulo || diasSelecionados.length === 0) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();

  for (let dia = hoje.getDate(); dia <= ultimoDia; dia++) {

    const dataAtual = new Date(ano, mes, dia);
    const diaSemana = dataAtual.getDay();

    if (diasSelecionados.includes(diaSemana)) {

      tarefas.push({
        titulo,
        prioridade,
        concluida: false,
        data: dataAtual.toISOString().split("T")[0],
        horario: horario || null
      });

    }
  }

  salvarLocal();
  atualizarDashboard();
  renderizarTarefas();
  renderizarConcluidas();
  fecharModal();
}

// ================= DASHBOARD =================

let statusChart;
let priorityChart;

function atualizarDashboard() {

  const totalEl = document.getElementById("totalCount");
  if (!totalEl) return;

  const total = tarefas.length;
  const concluidas = tarefas.filter(t => t.concluida).length;
  const pendentes = total - concluidas;
  const alta = tarefas.filter(t => t.prioridade === "alta").length;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("concluidasCount").innerText = concluidas;
  document.getElementById("pendentesCount").innerText = pendentes;
  document.getElementById("altaCount").innerText = alta;

  if (statusChart) {
    statusChart.data.datasets[0].data = [concluidas, pendentes];
    statusChart.update();
  }

  if (priorityChart) {
    priorityChart.data.datasets[0].data = [
      tarefas.filter(t => t.prioridade === "alta").length,
      tarefas.filter(t => t.prioridade === "media").length,
      tarefas.filter(t => t.prioridade === "baixa").length
    ];
    priorityChart.update();
  }
}

function iniciarGraficos() {

  const statusCanvas = document.getElementById("statusChart");
  const priorityCanvas = document.getElementById("priorityChart");
  const progressCanvas = document.getElementById("progressChart");

  if (!statusCanvas) return;

  // 🔵 STATUS DAS TAREFAS (DONUT)
  statusChart = new Chart(statusCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Concluídas', 'Pendentes'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#22c55e', '#3b82f6'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      cutout: '65%'
    }
  });

  // 🟡 PRIORIDADE (BARRAS)
 priorityChart = new Chart(priorityCanvas, {
  type: 'doughnut',
  data: {
    labels: ['Alta', 'Média', 'Baixa'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    cutout: '65%'
  }
});

} 

// 📈 PROGRESSO DIÁRIO (LINHA)
const progressCanvas = document.getElementById("progressChart");

if (progressCanvas) {

  const dias = [];
  const valores = [];

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();

  for (let i = 1; i <= ultimoDia; i++) {
    const data = new Date(ano, mes, i).toISOString().split("T")[0];
    const tarefasDoDia = tarefas.filter(t => t.data === data).length;

    dias.push(i);
    valores.push(tarefasDoDia);
  }

  new Chart(progressCanvas, {
    type: 'line',
    data: {
      labels: dias,
      datasets: [{
        label: 'Tarefas por dia',
        data: valores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' }
        }
      }
    }
  });

}




// ================= TAREFAS (VISÃO DIÁRIA) =================

function renderizarTarefas() {

  const lista = document.getElementById("listaTarefas");
  if (!lista) return;

  const empty = document.getElementById("emptyState");
  const listaCount = document.getElementById("listaCount");

  lista.innerHTML = "";

  const hoje = new Date().toISOString().split("T")[0];
  const tarefasHoje = tarefas.filter(t => t.data === hoje);

  listaCount.innerText = tarefasHoje.length;

  if (tarefasHoje.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  tarefasHoje.forEach((tarefa) => {

    const indexReal = tarefas.indexOf(tarefa);

    const item = document.createElement("div");
    item.className = "flex justify-between items-center border rounded-xl p-4 hover:shadow-sm transition";

    item.innerHTML = `
      <div class="flex items-center gap-4">

        <input type="checkbox" 
          ${tarefa.concluida ? "checked" : ""} 
          onchange="toggleConcluida(${indexReal})"
          class="w-5 h-5">

        <div>
          <p class="${tarefa.concluida ? "line-through text-gray-400" : "font-medium"}">
            ${tarefa.horario ? tarefa.horario + " — " : ""}
            ${tarefa.titulo}
          </p>
        </div>

      </div>

      <button onclick="deletarTarefa(${indexReal})" 
        class="text-gray-400 hover:text-red-600 transition">
        ✕
      </button>
    `;

    lista.appendChild(item);
  });
}

// ================= CONCLUÍDAS =================

function renderizarConcluidas() {

  const lista = document.getElementById("listaConcluidas");
  if (!lista) return;

  const empty = document.getElementById("emptyConcluidas");

  lista.innerHTML = "";

  const concluidas = tarefas.filter(t => t.concluida);

  if (concluidas.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  concluidas.forEach((tarefa) => {

    const item = document.createElement("div");
    item.className = "border rounded-lg p-3 text-gray-500 line-through";

    item.innerText = tarefa.horario
      ? tarefa.horario + " — " + tarefa.titulo
      : tarefa.titulo;

    lista.appendChild(item);
  });
}

// ================= AÇÕES =================

function toggleConcluida(index) {
  tarefas[index].concluida = !tarefas[index].concluida;
  salvarLocal();
  atualizarDashboard();
  renderizarTarefas();
  renderizarConcluidas();
}

function deletarTarefa(index) {
  tarefas.splice(index, 1);
  salvarLocal();
  atualizarDashboard();
  renderizarTarefas();
  renderizarConcluidas();
}

// ================= MENU ATIVO =================

function destacarMenuAtivo() {
  const pagina = window.location.pathname.split("/").pop();

  if (pagina === "dashboard.html") {
    document.getElementById("linkDashboard")?.classList.add("bg-blue-100", "text-blue-600");
  }

  if (pagina === "tarefas.html") {
    document.getElementById("linkTarefas")?.classList.add("bg-blue-100", "text-blue-600");
  }

  if (pagina === "concluidas.html") {
    document.getElementById("linkConcluidas")?.classList.add("bg-blue-100", "text-blue-600");
  }

  if (pagina === "calendario.html") {
    document.getElementById("linkCalendario")?.classList.add("bg-blue-100", "text-blue-600");
  }
}
function atualizarDataAtual() {

  const elementoData = document.getElementById("dataAtual");
  if (!elementoData) return;

  const hoje = new Date();

  const opcoes = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  const dataFormatada = hoje.toLocaleDateString("pt-BR", opcoes);

  // Primeira letra maiúscula
  const dataFinal = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  elementoData.innerText = dataFinal;
}

// ================= TEMA =================

function aplicarTemaSalvo() {
  const tema = localStorage.getItem("tema");

  if (tema === "dark") {
    document.documentElement.classList.add("dark");
    moverToggle(true);
  }
}

function moverToggle(ativo) {
  const circle = document.getElementById("toggleCircle");
  if (!circle) return;

  circle.style.transform = ativo
    ? "translateX(28px)"
    : "translateX(0)";
}

function alternarTema() {
  const isDark = document.documentElement.classList.toggle("dark");

  localStorage.setItem("tema", isDark ? "dark" : "light");

  moverToggle(isDark);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle");

  aplicarTemaSalvo();

  if (btn) {
    btn.addEventListener("click", alternarTema);
  }
});

// ================= INIT =================

iniciarGraficos();
atualizarDashboard();
renderizarTarefas();
renderizarConcluidas();
destacarMenuAtivo();
atualizarDataAtual();
