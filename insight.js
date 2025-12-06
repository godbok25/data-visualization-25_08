// =========================
// SECTION 3: 트렌드 + 공공데이터 통합 레이더
// =========================

// 레이더 축으로 쓸 전통 소재 5개
const RADAR_AXES = [
    { id: "자개", trendKeyword: "자개 굿즈", category: "자개" },
    { id: "민화", trendKeyword: "민화 굿즈", category: "민화" },
    { id: "전통문양", trendKeyword: "전통문양 굿즈", category: "전통문양" },
    { id: "생활공예", trendKeyword: "생활공예 굿즈", category: "생활공예" },
    { id: "전통회화", trendKeyword: "전통회화 굿즈", category: "전통회화" },
];

// Google Trends groups 구조에서 특정 키워드의 평균 관심도(0~100) 구하기
function getTrendAverage(groups, keyword) {
    if (!groups) return 0;
    for (const g of groups) {
        for (const s of g.series) {
            if (s.keyword === keyword) {
                const values = s.data.map((p) => p.value);
                const sum = values.reduce((a, b) => a + b, 0);
                return sum / values.length;
            }
        }
    }
    return 0;
}

// 공공데이터(bubbleItems)에서 카테고리별 판매·관심 평균 구하기
function getPublicScore(category) {
    const items = (window.bubbleItems || []).filter(
        (it) => it.category === category
    );
    if (!items.length) return 0;

    const sum = items.reduce(
        (acc, it) => acc + (it.salesScore + it.interestScore) / 2,
        0
    );
    return sum / items.length;
}

// 레이더에 쓸 labels + datasets 만들기
function buildRadarData(groups) {
    const labels = RADAR_AXES.map((a) => a.id);
    const trendScores = [];
    const publicScores = [];
    const combinedScores = [];

    RADAR_AXES.forEach((axis) => {
        const t = getTrendAverage(groups, axis.trendKeyword);   // 0~100
        const p = getPublicScore(axis.category);                // 0~100
        const c = (t + p) / 2;

        trendScores.push(Math.round(t * 10) / 10);
        publicScores.push(Math.round(p * 10) / 10);
        combinedScores.push(Math.round(c * 10) / 10);
    });

    return { labels, trendScores, publicScores, combinedScores };
}

function initInsightRadarCombined() {
    const canvas = document.getElementById("insightRadar");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // trend.js에서 먼저 세팅해 둔 전역 groups 사용
    const groups = window.trendGroups || null;
    if (!groups) {
        console.warn("trendGroups가 아직 없습니다. trends_merged.json 로딩 확인 필요");
        return;
    }

    const { labels, trendScores, publicScores, combinedScores } =
        buildRadarData(groups);

    new Chart(ctx, {
        type: "radar",
        data: {
            labels,
            datasets: [
                {
                    label: "트렌드 관심도",
                    data: trendScores,
                    borderColor: "rgba(239, 68, 68, 0.9)",
                    backgroundColor: "rgba(239, 68, 68, 0.20)",
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(239, 68, 68, 1)",
                },
                {
                    label: "공공데이터 지수",
                    data: publicScores,
                    borderColor: "rgba(59, 130, 246, 0.9)",
                    backgroundColor: "rgba(59, 130, 246, 0.20)",
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(59, 130, 246, 1)",
                },
                {
                    label: "종합 리디자인 잠재력",
                    data: combinedScores,
                    borderColor: "rgba(16, 185, 129, 0.9)",
                    backgroundColor: "rgba(16, 185, 129, 0.20)",
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: "rgba(16, 185, 129, 1)",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: "rgba(148, 163, 184, 0.9)",
                        backdropColor: "transparent",
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.25)",
                    },
                    angleLines: {
                        color: "rgba(148, 163, 184, 0.25)",
                    },
                    pointLabels: {
                        color: "rgba(226, 232, 240, 0.98)",
                        font: { size: 12 },
                    },
                },
            },
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        color: "rgba(226, 232, 240, 0.98)",
                        boxWidth: 18,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}`,
                    },
                },
            },
        },
    });
}

// 페이지 로딩이 끝난 뒤 실행 (trend.js가 먼저 실행된다는 가정)
window.addEventListener("load", initInsightRadarCombined);
