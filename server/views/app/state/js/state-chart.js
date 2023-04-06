function statehrChart(hr, timeline) {
    new Chart(document.getElementById("hrchart"), {
        "type": "line",
        "data": {
            "labels": timeline,
            "datasets": [{
                // "label": "심박수",
                "data": hr,
                "fill": false,
                "borderColor": "#009efb",
                "lineTension": 0.5
            }]
        },
        "options": { legend: { display: false } }
    });
}

function staterrChart(rr, timeline) {
    new Chart(document.getElementById("rrchart"), {
        "type": "line",
        "data": {
            "labels": timeline,
            "datasets": [{
                // "label": "호흡수",
                "data": rr,
                "fill": false,
                "borderColor": "#26c6da",
                "lineTension": 0.5
            }]
        },
        "options": { legend: { display: false } }

    });
}

function statesvChart(sv, timeline) {
    new Chart(document.getElementById("svchart"), {
        "type": "line",
        "data": {
            "labels": timeline,
            "datasets": [{
                // "label": "심박출량",
                "data": sv,
                "fill": false,
                "borderColor": "#ffbc34",
                "lineTension": 0.5
            }]
        },
        "options": { legend: { display: false } }
    });
}

function statehrvChart(hrv, timeline) {
    new Chart(document.getElementById("hrvchart"), {
        "type": "line",
        "data": {
            "labels": timeline,
            "datasets": [{
                // "label": "심박변이도",
                "data": hrv,
                "fill": false,
                "borderColor": "#7460ee",
                "lineTension": 0.5
            }]
        },
        "options": { legend: { display: false } }
    });
}

function stateStressChart(stress, stressTime) {
    new Chart(document.getElementById("dstress"), {
        "type": "line",
        "data": {
            "labels": stressTime,
            "datasets": [{
                // "label": "일간스트레스 지수",
                "data": stress,
                "fill": false,
                "borderColor": "#009c34",
                "lineTension": 0.5
            }]
        },
        "options": { legend: { display: false } }
    });
}