// THEME TOGGLE
const root = document.documentElement;
const btnDark = document.getElementById("themeDark");
const btnLight = document.getElementById("themeLight");

function setTheme(mode) {
  root.setAttribute("data-theme", mode);
  if (mode === "dark") {
    btnDark.classList.add("is-active");
    btnLight.classList.remove("is-active");
  } else {
    btnLight.classList.add("is-active");
    btnDark.classList.remove("is-active");
  }
}

btnDark.addEventListener("click", () => setTheme("dark"));
btnLight.addEventListener("click", () => setTheme("light"));

// GROUP TOGGLES
const toggleA = document.getElementById("toggleA");
const toggleB = document.getElementById("toggleB");
const toggleC = document.getElementById("toggleC");

const palette = [
  { border: "rgba(56, 189, 248, 1)", fill: "rgba(56, 189, 248, 0.22)" },
  { border: "rgba(96, 165, 250, 1)", fill: "rgba(96, 165, 250, 0.22)" },
  { border: "rgba(167, 139, 250, 1)", fill: "rgba(167, 139, 250, 0.22)" },
];

let chart;

function buildLegend(datasets) {
  const legend = document.getElementById("legendInline");
  legend.innerHTML = "";
  datasets.forEach((ds, idx) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    const sw = document.createElement("span");
    sw.className = "legend-swatch";
    sw.style.background = palette[idx].border;
    const label = document.createElement("span");
    label.textContent = ds.label;
    legend.appendChild(item);
    item.appendChild(sw);
    item.appendChild(label);
  });
}

fetch("trends_merged.json")
  .then((res) => res.json())
  .then((json) => {
    const groups = json.groups || [];
    if (!groups.length) return;

    // 대표 키워드: 각 그룹의 첫 번째 시리즈 사용
    const labels = groups[0].series[0].data.map((p) => p.date);

    const datasets = groups.map((g, idx) => {
      const rep = g.series[0];
      return {
        label: `${g.label} · ${rep.keyword}`,
        data: rep.data.map((p) => p.value),
        borderColor: palette[idx].border,
        backgroundColor: palette[idx].fill,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHitRadius: 6,
        hidden: false,
      };
    });

    const ctx = document.getElementById("trendChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const raw = items[0].label || "";
                return raw.replace(/-/g, ".");
              },
              label: (item) => {
                const v = item.parsed.y;
                return `${item.dataset.label}: ${v}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(148, 163, 184, 0.15)",
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 6,
              color: "rgba(148, 163, 184, 0.9)",
              font: { size: 10 },
            },
          },
          y: {
            grid: {
              color: "rgba(148, 163, 184, 0.15)",
            },
            ticks: {
              color: "rgba(148, 163, 184, 0.9)",
              font: { size: 10 },
              beginAtZero: true,
              max: 100,
            },
          },
        },
      },
    });

    buildLegend(datasets);

    function syncVisibility() {
      const flags = [toggleA.checked, toggleB.checked, toggleC.checked];
      flags.forEach((on, idx) => {
        chart.setDatasetVisibility(idx, on);
      });
      chart.update();
    }

    toggleA.addEventListener("change", syncVisibility);
    toggleB.addEventListener("change", syncVisibility);
    toggleC.addEventListener("change", syncVisibility);
  })
  .catch((err) => {
    console.error("데이터 로드 오류:", err);
  });

// Active Menu Highlight on Scroll
const sections = document.querySelectorAll("section.page-section");
const navLi = document.querySelectorAll(".gnb-menu li a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    // Offset for fixed header
    if (scrollY >= sectionTop - 150) {
      current = section.getAttribute("id");
    }
  });

  navLi.forEach((a) => {
    a.classList.remove("active");
    if (a.getAttribute("href").includes(current)) {
      a.classList.add("active");
    }
  });
});