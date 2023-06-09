function graphs(dataset) {
    this.name = null
    this.dataset = dataset;
    this.secondaryDataset = null;
    this.LEFT = 20;
    this.Y_GRID_TEXT_LEFT = 2;
    this.RIGHT = 25;
    this.Y_GRID_TEXT_RIGHT = 22;
    this.TOP = 20;
    this.Y_GRID_TEXT_TOP = 10;
    this.BOTTOM = 10;
    this.BOTTOM_HEIGHT = 1;
    this.WIDTH = 200;
    this.HEIGHT = 100;
    this.SKIP = 2;
    this.Y_LINES = 3;
    this.CIRCLE_RADIUS = 2;
    this.RESCALE_COUNT_LIMIT = 10;
    this.history = {
        rr: [],
        hr: [],
        sv: [],
        hrv: [],
        ss: []
    };
    this.minScales = {
        rr: 1,
        hr: 10,
        sv: 1,
        hrv: 1,
        ss: 0
    };
    this.minMax = {
        rr: { min: null, max: null, count: 0 },
        hr: { min: null, max: null, count: 0 },
        sv: { min: null, max: null, count: 0 },
        hrv: { min: null, max: null, count: 0 },
        ss: { min: null, max: null, count: 0 }
    };
    this.targetHrvValue = 0;
    this.currentHrvValue = 0;

    this.targetHrValue = 0;
    this.currentHrValue = 0;

    this.targetSvValue = 0;
    this.currentSvValue = 0;

    this.targetRrValue = 0;
    this.currentRrValue = 0;

    this.targetSsValue = 0;
    this.currentSsValue = 0;

    this.hrContainer = $('.graphsContainer #heartrate');
    this.rrContainer = $('.graphsContainer #respirationrate');
    this.svContainer = $('.graphsContainer #strokevolume');
    this.hrvContainer = $('.graphsContainer #heartratevariability');
    this.ssContainer = $('.sscontainer #ssrate');
    this.inbedContainer = $('.graphsContainer .inbedValue');
    this.chartYGridContainer = $('.chartContainer #chartYGrid');
    this.chartXGridContainer = $('.chartContainer #chartXGrid');
    this.chartAreaContainer = $('.graphsArea.chart');
    this.chartContainer = document.getElementById("chart");
    this.ytitle = [hrtitle, rrtitle, svtitle, hrvtitle];
    this.pname = null;
    setTimeout(this.pollForChangedValues.bind(this), 5000 / 10);
}

graphs.prototype.setDataset = function(dataset) {
    this.dataset = dataset;
};

graphs.prototype.setSecondaryDataset = function(dataset) {
    if (this.secondaryDataset != dataset) {
        this.secondaryDataset = dataset;
        return true;
    } else {
        this.secondaryDataset = null;
        return false;
    }
};

graphs.prototype.pollForChangedValues = function() {
    if (this.targetHrValue != this.shownHrValue) {
        this.hrContainer.text('' + this.targetHrValue);
        this.shownHrValue = this.targetHrValue;
    }
    if (this.targetRrValue != this.shownRrValue) {
        this.rrContainer.text('' + this.targetRrValue);
        this.shownRrValue = this.targetRrValue;
    }
    if (this.targetSvValue != this.shownSvValue) {
        this.svContainer.text('' + this.targetSvValue);
        this.shownSvValue = this.targetSvValue;
    }
    if (this.targetHrvValue != this.shownHrvValue) {
        this.hrvContainer.text('' + this.targetHrvValue);
        this.shownHrvValue = this.targetHrvValue;
    }
    if (this.targetSsValue != this.shownSsValue) {
        this.ssContainer.text('' + this.targetSsValue);
        this.shownSsValue = this.targetSsValue;
    }
    if (this.inbed != this.shownInbed) {
        this.inbedContainer.css('opacity', 0)
            .filter('.inbed' + this.inbed).css('opacity', 1.0);
        this.shownInbed = this.inbed;
    }

    var width = this.getWidth();
    // alert(this.ytitle)
    var chart = ''



    this.chartContainer.setAttribute("viewBox", "0 0 " + width + " 100");
    $(".chartContent").remove();
    var chart = this.calculateChart(this.history[this.dataset], (this.secondaryDataset ? this.history[this.secondaryDataset] : null), width, this.ytitle);
    chart.points.forEach(function(points) {
        if (this.dataset == 'hr') {
            var chartLine = this.createSvgElement("polyline", {
                'class': 'chartContent chartLineHr',
                'points': points.line
            });
        } else {
            var chartLine = this.createSvgElement("polyline", {
                'class': 'chartContent chartLine',
                'points': points.line
            });
        }
        this.chartContainer.append(chartLine);
    }.bind(this));
    chart.points2.forEach(function(points) {
        if (this.secondaryDataset == 'sv') {
            var chartLine2 = this.createSvgElement("polyline", {
                'class': 'chartContent chartLine2Sv',
                'points': points.line
            });
        } else {
            var chartLine2 = this.createSvgElement("polyline", {
                'class': 'chartContent chartLine2',
                'points': points.line
            });
        }
        this.chartContainer.append(chartLine2);
    }.bind(this));
    this.chartYGridContainer.html(chart.y1.lines + ' ' + chart.y2.lines);
    this.chartXGridContainer.html(chart.x.lines);
    setTimeout(this.pollForChangedValues.bind(this), 10000 / 10);
};

graphs.prototype.getWidth = function() {
    return this.chartAreaContainer.width() / this.chartAreaContainer.height() * this.HEIGHT;
};

graphs.prototype.createSvgElement = function(elementName, attrs) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', elementName);
    for (var attr in attrs) {
        element.setAttribute(attr, attrs[attr]);
    }
    return element;
};

graphs.prototype.setYTitle = function(classSuffix) {
    let classSuffixTitle
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/rtime/rtimePage',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode,
            accessToken: accessToken,
            lang: lang
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            let rtPage = result.rtimePage
            if (classSuffix == 'hr') {
                classSuffixTitle = rtPage.btnTop1;
            } else if (classSuffix == 'rr') {
                classSuffixTitle = rtPage.btnTop2;
            } else if (classSuffix == 'sv') {
                classSuffixTitle = rtPage.btnTop3;
            } else if (classSuffix == 'hrv') {
                classSuffixTitle = rtPage.btnTop4;
            }
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    return classSuffixTitle
}

graphs.prototype.calculateChart = function(dataset, secondaryDataset, width, ytitle) {

    let slice1 = this.getSlice(dataset, width);
    let slice2 = this.getSlice(secondaryDataset, width);
    let xLines = this.calculateXScale(slice1, width);

    let yLines1 = this.calculateYScale(this.dataset, this.dataset, slice1, width, this.Y_GRID_TEXT_LEFT, true, ytitle);
    let points1 = this.calculateChartPoints(slice1, yLines1.min, yLines1.max, width);

    let yLines2 = this.calculateYScale(this.secondaryDataset, this.secondaryDataset, slice2, width,
        width - this.Y_GRID_TEXT_RIGHT, false, ytitle);
    let points2 = this.calculateChartPoints(slice2, yLines2.min, yLines2.max, width);
    return { points: points1, points2: points2, y1: yLines1, y2: yLines2, x: xLines };
};

graphs.prototype.getSlice = function(dataset, width) {
    if (dataset) {
        var startIndex = Math.max(0,
            Math.ceil(dataset.length - ((width - this.LEFT - this.RIGHT) / this.SKIP) - 1));
        return dataset.slice(startIndex);
    } else {
        return null;
    }
};

graphs.prototype.calculateChartPoints = function(slice, min, max, width) {
    if (slice && slice.length > 0 && max > min) {
        var currentSlice;
        var slices = [];
        var prevValue = 0;
        slice.forEach(function(value, index) {
            if (value !== 0) {
                if (prevValue === 0) {
                    currentSlice = [];
                    slices.push(currentSlice);
                }
                currentSlice.push({ value: value, index: index });
            }
            prevValue = value;
        });
        var points = [];
        slices.forEach(function(currentSlice) {
            var currentPoints = {};
            currentPoints.line = currentSlice.map(function(data) {
                return (data.index * this.SKIP + this.LEFT) + "," + this.calculateY(data.value, min, max);
            }.bind(this)).join(" ");
            var endIndex = currentSlice[currentSlice.length - 1].index * this.SKIP + this.LEFT;
            var startIndex = currentSlice[0].index * this.SKIP + this.LEFT;
            currentPoints.fill =
                currentPoints.line + " " + endIndex + "," + (this.HEIGHT - this.BOTTOM - this.BOTTOM_HEIGHT) + " " +
                startIndex + "," + (this.HEIGHT - this.BOTTOM - this.BOTTOM_HEIGHT) + "";
            points.push(currentPoints);
        }.bind(this));
        return points;
    } else {
        return [{ line: "", fill: "" }];
    }
};

graphs.prototype.calculateYScale = function(datasetName, classSuffix, slice, width, textPosition, addLines, setYTitle) {
    var values = this.minMax[datasetName];
    var lines
    if (values) {
        var lines = '<circle class="titleCircle' + classSuffix +
            '" cx="' + (textPosition + this.CIRCLE_RADIUS) +
            '" cy="' + (this.Y_GRID_TEXT_TOP - this.CIRCLE_RADIUS) +
            '" r="' + this.CIRCLE_RADIUS + '"/>';
        if (classSuffix == 'hr') {
            lines += '<text class="graph_name titleText' + classSuffix +
                '" x="' + (textPosition + 2 + this.CIRCLE_RADIUS * 2) +
                '" y="' + this.Y_GRID_TEXT_TOP + '">' +
                setYTitle[0] + '</text> ';
        } else if (classSuffix == 'rr') {
            lines += '<text class="graph_name titleText' + classSuffix +
                '" x="' + (textPosition + 2 + this.CIRCLE_RADIUS * 2) +
                '" y="' + this.Y_GRID_TEXT_TOP + '">' +
                setYTitle[1] + '</text> ';
        } else if (classSuffix == 'sv') {
            let blank = 20
            if (setYTitle[2].length < 4) {
                blank -= 13
            } else if (setYTitle[2].length > 4) {
                blank += 5
            }
            lines += '<text class="graph_name titleText' + classSuffix +
                '" x="' + (textPosition - blank - this.CIRCLE_RADIUS * 2) +
                '" y="' + this.Y_GRID_TEXT_TOP + '">' +
                setYTitle[2] + '</text> ';
        } else {
            let blank = 20
            if (setYTitle[3].length < 4) {
                blank -= 13
            } else if (setYTitle[3].length > 4) {
                blank += 5
            }
            lines += '<text class="graph_name titleText' + classSuffix +
                '" x="' + (textPosition - blank - this.CIRCLE_RADIUS * 2) +
                '" y="' + this.Y_GRID_TEXT_TOP + '">' +
                setYTitle[3] + '</text> ';
        }

        var scale1 = this.getScale(datasetName, values, width, textPosition, addLines);
        lines += '' + scale1.lines;
        return {
            min: scale1.min,
            max: scale1.max,
            lines: lines
        };
    } else {
        return { min: 0, max: 0, lines: '' };
    }
};

graphs.prototype.getScale = function(datasetName, values, width, textPosition, addLines) {
    var lines = '';
    var scaleDiff = (values.max - values.min) / this.Y_LINES;
    var scale = Math.max(this.minScales[datasetName], this.calculateScale(scaleDiff));
    var scalePrecision = Math.max(0, -Math.floor(Math.log10(scale)));
    var min = this.calculateMin(values, scale);
    var max = min + ((this.Y_LINES + 1) * scale);
    for (var i = 0; i <= (this.Y_LINES + 1); i++) {
        var value = min + (i * scale);
        var realY = this.calculateY(value, min, max);
        if (addLines) {
            lines += ' <line x1="' + this.LEFT + '" y1="' + realY +
                '" x2="' + (width - this.RIGHT) + '" y2="' + realY + '"></line>';
        }
        lines +=
            ' <text x="' + textPosition + '" y="' + realY + '">' +
            value.toFixed(scalePrecision) + '</text>';
    }
    return { min: min, max: max, lines: lines };
};

graphs.prototype.calculateMin = function(values, scale) {
    var avg = (values.min + values.max) / 2.0;
    var min = Math.max(avg - ((this.Y_LINES) / 2.0 * scale), 0);
    return Math.floor(min / scale) * scale;
    //return Math.floor(values.min / scale) * scale;
};

graphs.prototype.calculateScale = function(diff) {
    var power;
    if (diff !== 0) {
        power = Math.pow(10, Math.round(Math.log10(diff)));
    } else {
        power = 1;
    }
    if (diff !== 0) {
        return Math.ceil(diff / power) * power;
    } else {
        return 1;
    }
};

graphs.prototype.calculateMinMax = function(dataset) {
    if (dataset) {
        var values = { min: null, max: null };
        dataset.forEach(function(value) {
            if (value !== 0) {
                if (values.min !== null) {
                    values.min = Math.min(values.min, value);
                } else {
                    values.min = value;
                }
                if (values.max !== null) {
                    values.max = Math.max(values.max, value);
                } else {
                    values.max = value;
                }
            }
        });
        return values;
    } else {
        return null;
    }
};

graphs.prototype.setMinMax = function(datasetName, value) {
    var currentValues = this.minMax[datasetName];
    if (value != 0) {
        if (!currentValues.min || !currentValues.max) {
            currentValues.min = value;
            currentValues.max = value;
            currentValues.count = 0;
        } else if (currentValues.min >= value) {
            currentValues.min = value;
            currentValues.count = 0;
        } else if (currentValues.max < value) {
            currentValues.max = value;
            currentValues.count = 0;
        } else {
            currentValues.count++;
            if (currentValues.count >= this.RESCALE_COUNT_LIMIT) {
                var newValues = this.calculateMinMax(this.getSlice(this.history[datasetName],
                    this.getWidth()));
                currentValues.max = newValues.max;
                currentValues.min = newValues.min;
                currentValues.count = 0;
            }
        }
    }
};

graphs.prototype.calculateXScale = function(slice, width) {
    if (slice.length > 1) {
        return {
            lines: '<line x1="' + this.LEFT + '" y1="' + this.TOP +
                '" x2="' + this.LEFT + '" y2="' + (this.HEIGHT - this.BOTTOM) + '"></line> ' +
                '<line x1="' + (width - this.RIGHT) + '" y1="' + this.TOP +
                '" x2="' + (width - this.RIGHT) + '" y2="' + (this.HEIGHT - this.BOTTOM) + '"></line>'
        };
    } else {
        return { lines: '' };
    }
};

graphs.prototype.calculateY = function(value, min, max) {
    return this.HEIGHT - this.BOTTOM - ((this.HEIGHT - this.TOP - this.BOTTOM) *
        (value - min) / (max - min));
};

graphs.prototype.setValues = function(value) {
    //this.setValue(value);
    for (var i in value) {
        setTimeout(this.setValue(value[i]), 5000);
    }
};


graphs.prototype.setValue = function(value) {

    this.targetHrValue = value[0];
    this.targetRrValue = value[1];
    this.targetSvValue = value[2];
    this.targetHrvValue = value[3];
    this.targetSsValue = value[4];

    this.history.hr.push(value[0]);
    this.setMinMax('hr', value[0]);

    this.history.rr.push(value[1]);
    this.setMinMax('rr', value[1]);


    this.setMinMax('sv', value[2]);
    this.history.sv.push(value[2]);


    this.setMinMax('hrv', value[3]);
    this.history.hrv.push(value[3]);

    this.history.ss.push(value[4]);
    this.setMinMax('ss', value[4]);

};