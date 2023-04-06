function layer_toggle(obj) {
    if (obj.style.display == 'none')
        obj.style.display = 'block';
    else if (obj.style.display == 'block')
        obj.style.display = 'none';
}
//건강상태>질병정보 
function disease_open() {
    layer_toggle(document.getElementById('d_simple'));
    layer_toggle(document.getElementById('d_detail'));
    layer_toggle(document.getElementById('d_down'));
    layer_toggle(document.getElementById('d_up'));
    return false;
}

//건강상태>질병정보 각 항목 graph 표시
function detail(id) {
    var t = document.getElementById(id);
    if (t == diabetes) {
        dgraph.style.display = 'block'
        hgraph.style.display = 'none'
        agraph.style.display = 'none'

    } else if (t == hypertension) {
        dgraph.style.display = 'none'
        hgraph.style.display = 'block'
        agraph.style.display = 'none'

    } else if (t == atrialfibrillation) {
        dgraph.style.display = 'none'
        hgraph.style.display = 'none'
        agraph.style.display = 'block'
    }
}

//건강상태>생체정보
function bioinfo_open() {
    layer_toggle(document.getElementById('b_simple'));
    layer_toggle(document.getElementById('b_detail'));
    layer_toggle(document.getElementById('b_down'));
    layer_toggle(document.getElementById('b_up'));
    return false;
}

//건강상태>스트레스
function stress_open() {
    layer_toggle(document.getElementById('st_down'));
    layer_toggle(document.getElementById('st_up'));
    layer_toggle(document.getElementById('st_detail'));
    // layer_toggle(document.getElementById('st_simple'));

    return false;
}

//건강상태>수면정보
function sleep_open() {
    layer_toggle(document.getElementById('sl_down'));
    layer_toggle(document.getElementById('sl_up'));
    layer_toggle(document.getElementById('sl_detail'));
    // layer_toggle(document.getElementById('st_simple'));

    return false;
}