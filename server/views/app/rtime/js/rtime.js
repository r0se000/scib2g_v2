let selectUser = $('#user-select').val(),
    graph = null,
    fetch = null;

function init() {
    let selectOption = ''
    if (pUserCode == '') {
        if (userCount != 0) {
            for (let i = 0; i < userCount; i++) {
                selectOption = "<option value='" + selectuserList['user' + i].user_code + "'>" + selectuserList['user' + i].name + "</option>";
                $('select').append(selectOption)
            };
        }
    } else {
        if (selectUser != '0')
            graphReload()
    }
}

function graphReload() {
    clearInterval(fetch);
    if (graph) {
        graph.fetchedHistory = []
        graph.graphs.history = []
        graph.graphs.pollForChangedValues = ''
    }
    // $(".content_dashboard").load(window.location.href + "content_dashboard");
    graph = new bcgapp();
    $('.datasetbutton.secondary').removeClass('selected');

    if (pUserCode == '') {
        fetch = setInterval(graph.fetchData.bind(graph), 5000);
    } else {
        fetch = setInterval(graph.fetchData_P.bind(graph), 5000);
    }
}

$('#user-select').on('change', function() {
    selectUser = $(this).val()
    if (selectUser != 0) {
        $('.body').addClass('active')
        $('.body').removeClass('deactive')
        $('#app').remove()
        let bodyHtml = '<div id="app">' +
            '<div class="m-l-5 sscontainer">ss' +
            '<span id="ssrate"></span>' +
            '</div>' +
            '<div class="contentContainer graphsContainer transparentContainer" id="content_dashboard">' +
            '<div class="graphsContainer">' +
            '<div class="graphsArea chart" style="overflow-x: hidden">' +
            '<svg version="1.0" id="chart" class="chartContainer" viewBox="100 10 500 100">' +
            '<title id="title"></title>' +
            '<g class="grid" id="chartXGrid"/>' +
            '<g class="grid" id="chartYGrid"/>' +
            '<defs>' +
            '<linearGradient id="chartFillGradient" x1="0" x2="0" y1="0" y2="1">' +
            '<stop class="begin" offset="0"/>' +
            '<stop class="end" offset="100"/>' +
            '</linearGradient>' +
            '</defs>' +
            '</svg>' +
            '</div>' +
            '<div class="graphsArea respirationrate" style="height: 133px; width: 50%;">' +
            '<button class="datasetbutton primary primaryrr" id="respirationratebutton" dataset="rr">' +
            '<span class="datasetName">호흡수</span>' +
            '<span class="rateValue" id="respirationrate"></span>' +
            '<span class="datasetFooter">회/분</span>' +
            '</button>' +
            '</div>' +
            '<div class="graphsArea heartrate" style="height: 133px; width: 50%;">' +
            '<button class="datasetbutton primary primaryhr selected" id="heartratebutton" dataset="hr">' +
            '<span class="datasetName">심박수</span>' +
            '<span class="rateValue" id="heartrate"></span>' +
            '<span class="datasetFooter">회/분</span>' +
            '</button>' +
            '</div>' +
            '<div class="graphsArea strokevolume" style="height: 133px; width: 50%;">' +
            '<button class="datasetbutton secondary secondarysv" id="strokevolumebutton" dataset="sv">' +
            '<span class="datasetName">심박출량</span>' +
            '<span class="rateValue" id="strokevolume"></span>' +
            '<span class="datasetFooter">ul</span>' +
            '</button>' +
            '</div>' +
            '<div class="graphsArea heartratevariability" style="height: 133px; width: 50%;">' +
            '<button class="datasetbutton secondary secondaryhrv" id="heartratevariabilitybutton" dataset="hrv">' +
            '<span class="datasetName">심박변이도</span>' +
            '<span class="rateValue" id="heartratevariability"></span>' +
            '<span class="datasetFooter">ms</span>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
        $('.body').append(bodyHtml)

        graphReload()

    } else {
        $('.body').removeClass('active')
        $('.body').addClass('deactive')
        $('#app').remove()
    }

});
$('#btn-history').on('click', function() {
    location.href = "/api/rtime/rtimeHistory" + "?userCode=" + selectUser
})

function bcgapp() {

    this.appStartTime = new Date().getTime();
    this.previousViewport = {
        width: 0,
        height: 0
    };
    this.fetchedHistory = [];

    this.polling = true;
    this.emptyReceivedDataCount = 0;

    this.discoveryInProgress = false;

    this.graphUpdateInterval = null;

    // graphs
    this.graphs = new graphs("hr");
    this.touch = new touch();

    this.touch.bindTouch(
        '#menu .menuButton',
        function(e) {
            this.changeTab(e.currentTarget.id.replace("tab_", ""));
        }.bind(this)
    );

    this.touch.bindTouch(
        '.datasetbutton.primary',
        function(e) {
            $('.datasetbutton.primary').removeClass('selected');
            $(e.currentTarget).addClass('selected');
            this.graphs.setDataset($(e.currentTarget).attr('dataset'));
        }.bind(this)
    );

    this.touch.bindTouch(
        '.datasetbutton.secondary',
        function(e) {
            $('.datasetbutton.secondary').removeClass('selected');
            if (this.graphs.setSecondaryDataset($(e.currentTarget).attr('dataset'))) {
                $(e.currentTarget).addClass('selected');
            }
        }.bind(this)
    );

}

bcgapp.prototype.updateMainView = function() {
    // we need at least 10 readings to show the dials
    if (this.fetchedHistory) {
        this.graphs.setValues(this.fetchedHistory);
        this.graphs.name = selectUser;

    } else {
        var latestStatus = 0;
        if (this.fetchedHistory && this.fetchedHistory.length > 0) {
            latestStatus = this.fetchedHistory[0][6];
        }

        this.graphs.setValues({
            hr: 27.5,
            rr: 0,
            sv: 0,
            hrv: 0,
            ss: 0,
            status: latestStatus
        }, 0);
    }
};

bcgapp.prototype.fetchData = function() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/rtime/rtimeChartApp',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: selectUser,
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            let resultData = result.rtimeData;
            let data = JSON.parse(resultData)
            graph.fetchedHistory = data;
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    this.updateMainView();
};

bcgapp.prototype.fetchData_P = function() {
    let cmmContentType = 'application/json', // 콘텐츠 타입 
        cmmType = 'get', // 전송 방식
        cmmUrl = '/api/rtime/rtimeChartApp',
        cmmReqDataObj = { // 서버로 넘겨줄 데이터
            userCode: userCode,
        },
        cmmAsync = false, // false: 동기식, true: 비동기
        cmmSucc = function(result) {
            let resultData = result.rtimeData;
            let data = JSON.parse(resultData)
            graph.fetchedHistory = data;
        },
        cmmErr = null; // 에러 시 실행할 콜백 함수(없으면 null) 

    commAjax(cmmContentType, cmmType, cmmUrl, cmmReqDataObj, cmmAsync, cmmSucc, cmmErr);
    this.updateMainView();
};