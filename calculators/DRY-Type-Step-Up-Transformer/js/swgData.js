// Workshop SWG table with detailed dimensions
const swgTable = [
    { swg: "7/0", bareDia: 12.7, area: 126.6759563 },
    { swg: "6/0", bareDia: 11.786, area: 109.098712 },
    { swg: "5/0", bareDia: 10.973, area: 94.56654191 },
    { swg: "4/0", bareDia: 10.16, area: 81.07261205 },
    { swg: "3/0", bareDia: 9.449, area: 70.1226706 },
    { swg: "2/0", bareDia: 8.839, area: 61.36108319 },
    { swg: "0", bareDia: 8.23, area: 53.19691166 },
    { swg: "1", bareDia: 7.62, area: 45.60334428 },
    { swg: "2", bareDia: 7.01, area: 38.59426599 },
    { swg: "3", bareDia: 6.401, area: 32.17973061 },
    { swg: "4", bareDia: 5.893, area: 27.27467799 },
    { swg: "5", bareDia: 5.385, area: 22.77498843 },
    { swg: "6", bareDia: 4.877, area: 18.68066193 },
    { swg: "7", bareDia: 4.47, area: 15.692849 },
    { swg: "8", bareDia: 4.064, area: 12.97161793 },
    { swg: "9", bareDia: 3.658, area: 10.50930877 },
    { swg: "10", bareDia: 3.251, area: 8.300814118 },
    { swg: "11", bareDia: 2.946, area: 6.816355535 },
    { swg: "12", bareDia: 2.642, area: 5.482168454 },
    { swg: "13", bareDia: 2.337, area: 4.289475331 },
    { swg: "14", bareDia: 2.032, area: 3.242904482 },
    { swg: "15", bareDia: 1.829, area: 2.627327192 },
    { swg: "16", bareDia: 1.626, area: 2.076480381 },
    { swg: "17", bareDia: 1.422, area: 1.588129608 },
    { swg: "18", bareDia: 1.219, area: 1.167062625 },
    { swg: "19", bareDia: 1.016, area: 0.81072612 },
    { swg: "20", bareDia: 0.914, area: 0.656113753 },
    { swg: "21", bareDia: 0.813, area: 0.519120095 },
    { swg: "22", bareDia: 0.711, area: 0.397032402 },
    { swg: "23", bareDia: 0.61, area: 0.292244549 },
    { swg: "24", bareDia: 0.559, area: 0.245420234 },
    { swg: "25", bareDia: 0.508, area: 0.20268153 },
    { swg: "26", bareDia: 0.4572, area: 0.164172039 },
    { swg: "27", bareDia: 0.4166, area: 0.136309235 },
    { swg: "28", bareDia: 0.3759, area: 0.110976596 },
    { swg: "29", bareDia: 0.3454, area: 0.093698236 },
    { swg: "30", bareDia: 0.315, area: 0.077930571 },
    { swg: "31", bareDia: 0.2946, area: 0.068163555 },
    { swg: "32", bareDia: 0.2743, area: 0.059093317 },
    { swg: "33", bareDia: 0.254, area: 0.050670383 },
    { swg: "34", bareDia: 0.2337, area: 0.042894753 },
    { swg: "35", bareDia: 0.2134, area: 0.035766429 },
    { swg: "36", bareDia: 0.193, area: 0.029255085 },
    { swg: "37", bareDia: 0.1727, area: 0.023424559 },
    { swg: "38", bareDia: 0.1524, area: 0.018241338 },
    { swg: "39", bareDia: 0.1321, area: 0.013705421 },
    { swg: "40", bareDia: 0.1219, area: 0.011670626 },
    { swg: "41", bareDia: 0.1118, area: 0.009816809 },
    { swg: "42", bareDia: 0.1016, area: 0.008107261 },
    { swg: "43", bareDia: 0.0914, area: 0.006561138 },
    { swg: "44", bareDia: 0.0813, area: 0.005191201 },
    { swg: "45", bareDia: 0.0711, area: 0.003970324 },
    { swg: "46", bareDia: 0.061, area: 0.002922445 },
    { swg: "47", bareDia: 0.0508, area: 0.002026815 },
    { swg: "48", bareDia: 0.0406, area: 0.00129461 },
    { swg: "49", bareDia: 0.0305, area: 0.000730611 }
];

// Structural array processor
swgTable.forEach(item => {
    // Current based on standard 2.5 A/mm² density for dropdown max capacity
    item.current = item.area * 2.5;
});

function getSWGForCurrent(targetCurrent) {
    if (!targetCurrent || targetCurrent <= 0) return null;
    if (targetCurrent >= swgTable[0].current) return swgTable[0].swg;

    let bestMatch = swgTable[0];
    let minDiff = Math.abs(targetCurrent - bestMatch.current);

    for (let i = 1; i < swgTable.length; i++) {
        let diff = Math.abs(targetCurrent - swgTable[i].current);
        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = swgTable[i];
        }
    }
    return bestMatch.swg;
}

function getSWGForArea(targetArea) {
    if (!targetArea || targetArea <= 0) return null;
    if (targetArea >= swgTable[0].area) return swgTable[0].swg;

    let bestMatch = swgTable[0];
    let minDiff = Math.abs(targetArea - bestMatch.area);

    for (let i = 1; i < swgTable.length; i++) {
        let diff = Math.abs(targetArea - swgTable[i].area);
        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = swgTable[i];
        }
    }
    return bestMatch.swg;
}

function getSWGData(swgNumber) {
    let match = swgTable.find(item => item.swg.toString() === swgNumber.toString());
    if (!match) return null;

    return {
        swg: match.swg,
        current: parseFloat(match.current.toFixed(4)),
        area: parseFloat(match.area.toFixed(4)),
        bareDia: parseFloat(match.bareDia.toFixed(4)),
        insulatedDia: parseFloat(match.bareDia.toFixed(4)) // Using bareDia as insulatedDia per request
    };
}

// Flat wire helpers
function isThickWire(swg) {
    if (swg === null || swg === undefined || swg === "") return false;
    let matchIdx = swgTable.findIndex(item => item.swg.toString() === swg.toString());
    if (matchIdx === -1) return false;
    let limitIdx = swgTable.findIndex(item => item.swg.toString() === "13");
    return matchIdx <= limitIdx;
}

function generateSuggestedStrips(targetArea) {
    let roundedArea = Math.round(targetArea);
    if (roundedArea <= 0) return [];
    
    let suggestions = [];
    for (let h = 1; h <= Math.sqrt(roundedArea); h++) {
        if (roundedArea % h === 0) {
            let b = roundedArea / h;
            suggestions.push({ breadth: b, height: h });
        }
    }
    // Sort so most 'square-like' or thickest heights are first
    suggestions.sort((a, b) => b.height - a.height);
    return suggestions;
}