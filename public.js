// =========================
// SECTION 2: 버블 차트 종합 비교 (공공데이터 시각화)
// =========================

// 대표 상품 데이터 (예시 값)
// 대표 리디자인 굿즈 포지셔닝용 데이터 (0~100 지수)
const bubbleItems = [
    { label: "자개 텀블러", category: "자개", salesScore: 85, interestScore: 90 },
    { label: "민화 머그컵", category: "민화", salesScore: 75, interestScore: 88 },
    { label: "단청 패턴 파우치", category: "단청", salesScore: 65, interestScore: 82 },
    { label: "훈민정음 노트", category: "서체", salesScore: 68, interestScore: 76 },
    { label: "백자 달항아리 오브제", category: "도자/백자", salesScore: 60, interestScore: 72 },
    { label: "복식 패턴 스카프", category: "전통복식/문양", salesScore: 78, interestScore: 91 },
    { label: "전통 문살 액자", category: "건축/목공예", salesScore: 72, interestScore: 84 },
    { label: "한지 엽서 세트", category: "기타", salesScore: 55, interestScore: 65 },
    { label: "문양형 굿즈", category: "전통문양", salesScore: 75, interestScore: 80 },
    { label: "생활소품 리디자인", category: "생활공예", salesScore: 88, interestScore: 75 },
    { label: "전통회화 포스터", category: "전통회화", salesScore: 82, interestScore: 87 },
];

// 자동으로 리디자인 강도 계산 (판매·관심 단순 평균)
bubbleItems.forEach(item => {
    const rScore = (item.salesScore + item.interestScore) / 2;
    item.redesignScore = Math.round(rScore * 10) / 10; // 소수점 1자리 반올림
});

// 카테고리별 색상
const categoryColors = {
    "자개": "rgba(107, 126, 204, 0.75)",     // 퍼플블루
    "민화": "rgba(238, 157, 172, 0.75)",     // 로즈핑크
    "단청": "rgba(156, 193, 171, 0.75)",     // 세이지그린
    "서체": "rgba(132, 169, 205, 0.75)",     // 페일블루
    "도자/백자": "rgba(231, 201, 141, 0.75)", // 웜베이지
    "전통복식/문양": "rgba(246, 162, 98, 0.78)", // 밝고 따뜻한 주황톤
    "건축/목공예": "rgba(183, 138, 125, 0.75)", // 모카브라운
    "기타": "rgba(176, 210, 240, 0.75)",     // 연하늘색

    // ✨ 새로 추가된 카테고리
    "전통문양": "rgba(195, 179, 255, 0.75)", // 연보라톤
    "생활공예": "rgba(245, 180, 185, 0.75)", // 로즈 코랄톤
    "전통회화": "rgba(170, 210, 200, 0.75)", // 민트블루톤
};

function buildBubbleDatasets(items) {
    const grouped = {};

    // 1) 리디자인 점수의 최소/최대 구하기
    const scores = items.map(i => i.redesignScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore || 1; // 0 나누기 방지

    // 2) 각 아이템을 카테고리별로 묶으면서 반지름 스케일링
    items.forEach((item) => {
        const cat = item.category || "기타";
        if (!grouped[cat]) grouped[cat] = [];

        // 0~1 사이로 정규화한 후 10~48px 사이로 스케일
        const t = (item.redesignScore - minScore) / range; // 0~1
        const radius = 10 + t * 38; // 최소 10px, 최대 48px

        grouped[cat].push({
            x: item.salesScore,
            y: item.interestScore,
            r: radius,
            _label: item.label,
            _redesign: item.redesignScore,
        });
    });

    // 3) 카테고리별 dataset 생성
    return Object.keys(grouped).map((cat) => ({
        label: cat,
        data: grouped[cat],
        backgroundColor: categoryColors[cat] || categoryColors["기타"],
        borderColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: "rgba(120, 120, 120, 0.9)", // hover 시 그레이 테두리
    }));
}

function buildLegendBubble(id, items) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";

    const cats = [...new Set(items.map((i) => i.category || "기타"))];
    cats.forEach((cat) => {
        const wrap = document.createElement("div");
        wrap.className = "legend-item";

        const sw = document.createElement("span");
        sw.className = "legend-swatch";
        sw.style.background = categoryColors[cat] || categoryColors["기타"];

        const text = document.createElement("span");
        text.textContent = cat;

        wrap.appendChild(sw);
        wrap.appendChild(text);
        el.appendChild(wrap);
    });
}

function initBubbleChart() {
    const canvas = document.getElementById("chartBubble");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const datasets = buildBubbleDatasets(bubbleItems);

    new Chart(ctx, {
        type: "bubble",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animations: {
                radius: {
                    duration: 500,
                    easing: "easeOutQuart",
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const raw = ctx.raw;
                            return [
                                raw._label,
                                `판매지수: ${raw.x}`,
                                `관심지수: ${raw.y}`,
                                // `리디자인 강도: ${raw._redesign}`,
                            ];
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: { display: true, text: "판매지수 (0–100)" },
                    min: 40,
                    max: 95,
                    grid: {
                        color: "rgba(148,163,184,0.25)",
                        lineWidth: 1,
                    },
                    ticks: {
                        color: "rgba(148,163,184,0.95)",
                        font: { size: 11, weight: "500" },
                    },
                },
                y: {
                    title: { display: true, text: "관심지수 (0–100)" },
                    min: 60,
                    max: 100,
                    grid: {
                        color: "rgba(148,163,184,0.25)",
                        lineWidth: 1,
                    },
                    ticks: {
                        color: "rgba(148,163,184,0.95)",
                        font: { size: 11, weight: "500" },
                    },
                },
            },
        },
    });

    buildLegendBubble("legendBubble", bubbleItems);
}

// 페이지 로드 시 공공데이터 버블 차트 초기화
window.addEventListener("load", () => {
    initBubbleChart();   // 섹션2 버블
});