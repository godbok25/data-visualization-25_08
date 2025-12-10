// =========================
// SECTION 4: 분석 인사이트
// =========================

const RADAR_AXES = [
    "관심도", "지속 가능성", "인지도", "접근성", "시장성", "리디자인 적용도"
];

const radarDataSets = [
    {
        label: "트렌드 A그룹",
        data: [75, 84, 52, 45, 70, 80],
        borderColor: "rgba(255, 182, 193, 0.9)",      // 핑크
        backgroundColor: "rgba(255, 182, 193, 0.35)",
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "rgba(255, 182, 193, 0.9)"
    },
    {
        label: "트렌드 B그룹",
        data: [88, 68, 85, 35, 90, 70],
        borderColor: "rgba(255, 195, 99, 0.9)",       // 🎨 노랑-오렌지 (새 톤)
        backgroundColor: "rgba(255, 195, 99, 0.32)",
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "rgba(255, 195, 99, 0.9)"
    },
    {
        label: "트렌드 C그룹",
        data: [68, 74, 50, 40, 72, 85],
        borderColor: "rgba(200, 162, 255, 0.9)",      // 라벤더
        backgroundColor: "rgba(200, 162, 255, 0.35)",
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "rgba(200, 162, 255, 0.9)"
    },
    {
        label: "공공데이터 (판매·관심)",
        data: [70, 72, 60, 35, 74, 76],
        borderColor: "rgba(94, 127, 160, 0.95)",     // 🩵 그레이시 블루
        backgroundColor: "rgba(94, 127, 160, 0.30)",
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "rgba(94, 127, 160, 0.95)"
    },
    {
        label: "종합 리디자인 잠재력",
        data: [78, 78, 65, 39, 81, 79],
        borderColor: "rgba(110, 142, 130, 0.95)",     // 💚 그린 민트
        backgroundColor: "rgba(110, 142, 130, 0.30)",
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "rgba(110, 142, 130, 0.95)"
    }

];


function initInsightRadar() {
    const ctx = document.getElementById("insightRadar");
    if (!ctx) return;

    // 테마별 색상 반환 함수
    const getThemeColors = () => {
        // html 태그의 data-theme 속성 확인
        const isDark = document.documentElement.getAttribute("data-theme") !== "light";
        return {
            // 다크모드일 때 / 라이트모드일 때 그리드 및 텍스트 색상
            grid: isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.25)", // Light mode grid matches Section 3
            text: isDark ? "#E2E8F0" : "rgba(148, 163, 184, 0.95)", // Light mode text matches Section 3
        };
    };

    let themeColors = getThemeColors();

    const chart = new Chart(ctx, {
        type: "radar",
        data: { labels: RADAR_AXES, datasets: radarDataSets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    grid: { circular: true, color: themeColors.grid },
                    angleLines: { display: true, color: themeColors.grid }, // ✅ 중심에서 뻗어나가는 선 추가
                    pointLabels: { color: themeColors.text, font: { size: 13, weight: 600 } },
                    ticks: {
                        backdropColor: 'transparent',
                        color: themeColors.text,
                        font: { weight: 'normal' },
                        callback: function (value) {
                            return '      ' + value; // 숫자 앞에 공백을 더 주어 오른쪽으로 더 밀어냄
                        }
                    }
                },
            },
            plugins: { legend: { display: false } }, // 기본 범례 숨김
        },
    });

    // ------------------------------------
    // 체크박스 제어
    // ------------------------------------
    ["A", "B", "C", "Public", "Total"].forEach((key, i) => {
        // toggleTrendA, toggleTrendB ... 등 ID 매칭
        const el = document.getElementById(`toggleTrend${key}`) || document.getElementById(`toggle${key}`);
        if (el) {
            el.addEventListener("change", () => {
                chart.setDatasetVisibility(i, el.checked);
                chart.update();
            });
        }
    });

    // ------------------------------------
    // 테마 변경 감지 (Dark/Light)
    // ------------------------------------
    const observer = new MutationObserver(() => {
        const newColors = getThemeColors();
        // 차트 옵션 업데이트
        chart.options.scales.r.grid.color = newColors.grid;
        chart.options.scales.r.angleLines.color = newColors.grid; // ✅ 각도 선 색상 업데이트
        chart.options.scales.r.pointLabels.color = newColors.text;
        chart.options.scales.r.ticks.color = newColors.text; // ✅ 틱(숫자) 색상 업데이트
        chart.update();
    });

    // html 태그의 data-theme 속성 변화 감지
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });
}

window.addEventListener("load", initInsightRadar);
