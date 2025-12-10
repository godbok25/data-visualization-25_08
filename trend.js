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

// =======================
// MOBILE GNB SLIDE MENU
// =======================
const burgerBtn = document.querySelector(".gnb-burger");
const gnbMenu = document.getElementById("gnbMenu");
const closeBtn = document.querySelector(".gnb-close");

function openMenu() {
  gnbMenu.classList.add("active");

  // 햄버거 버튼 천천히 사라지기
  burgerBtn.style.transition = "opacity 0.25s ease";
  burgerBtn.style.opacity = "0";

  // 약간의 딜레이 후 숨기기 (자연스러운 타이밍)
  setTimeout(() => {
    burgerBtn.style.visibility = "hidden";
    document.body.style.overflow = "hidden";
  }, 250);
}

function closeMenu() {
  gnbMenu.classList.remove("active");

  // 햄버거 버튼 다시 천천히 등장
  burgerBtn.style.visibility = "visible";
  burgerBtn.style.transition = "opacity 0.25s ease";
  burgerBtn.style.opacity = "1";

  document.body.style.overflow = "";
}
// 햄버거 버튼 클릭 시
burgerBtn?.addEventListener("click", openMenu);
// 닫기 버튼 클릭 시
closeBtn?.addEventListener("click", closeMenu);
// 메뉴 항목 클릭 시 자동 닫기
document.querySelectorAll(".gnb-menu li a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
// 창 크기 조정 시 (데스크탑 전환 시 자동 닫기)
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});
////////////////////
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

fetch("./trends_merged.json")
  .then((res) => res.json())
  .then((json) => {
    const groups = json.groups || [];
    if (!groups.length) return;
    // 👇 인사이트 섹션에서 쓰게 전역에 저장
    window.trendGroups = groups;
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

// =======================
// GNB active + scroll 연동
// =======================

// 1) 섹션 / 네비 링크 가져오기
const sections = document.querySelectorAll("section.page-section");
const navLinks = document.querySelectorAll(".gnb-menu li a");

// 2) 메뉴 클릭(터치) 시:
//    - active 클래스 갱신
//    - 모바일(<=900px)이면 슬라이드 메뉴 닫기
navLinks.forEach((link) => {
  link.addEventListener(
    "click",
    () => {
      // 모든 메뉴에서 active 제거
      navLinks.forEach((l) => l.classList.remove("active"));
      // 클릭한 메뉴에 active 부여
      link.classList.add("active");

      // 모바일에서만 슬라이드 닫기
      if (window.innerWidth <= 900 && typeof closeMenu === "function") {
        closeMenu();
      }
    },
    { passive: true }
  );
});

// 3) 스크롤 위치에 따라 active 자동 업데이트
window.addEventListener("scroll", () => {
  let currentId = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (window.scrollY >= sectionTop - 150) {
      currentId = section.id;
    }
  });

  if (!currentId) return;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isMatch = href.includes(currentId);
    link.classList.toggle("active", isMatch);
  });
});

// 4) 창 크기 조정 시 (데스크톱 전환되면 슬라이드 강제 닫기)
window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && typeof closeMenu === "function") {
    closeMenu();
  }
});
// =======================
// TOP BUTTON
// =======================
const topButton = document.getElementById("topButton");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

topButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
