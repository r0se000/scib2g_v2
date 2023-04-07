/** ================================================================
 *  날짜 관련 공통 함수
 *  @author JG, Jo
 *  @since 2021.05.03
 *  @history 
 *  ================================================================
 */

/** 
 * 년 select box option 생성하기
 * 
 * @params $selBox - option을 추가하기 위한 기준 selectbox 요소(jquery 객체)
 * @author JG, Jo 
 * @since  2021.05.03
 */
 function setYearSelBox($selBox) {
    let date = new Date(),
        startYear = 1900,
        thisYear = date.getFullYear(),
        optStr = '';

    for (let i = thisYear; i >= startYear; i--) {
        optStr += '<option value="' + i + '">' + i + '</option>';
    }

    $selBox.append(optStr);
    $selBox.val('1970').prop('selected', true);
}

/** 
 * 월 select box option 생성하기
 * 
 * @params $selBox - option을 추가하기 위한 기준 selectbox 요소(jquery 객체)
 * @author JG, Jo 
 * @since  2021.05.03
 */
function setMonthSelBox($selBox) {
    let optStr = '';

    for (let i = 1; i <= 12; i++) {
        if (i < 10) {
            optStr += '<option value="0' + i + '">' + i + '</option>';
        } else {
            optStr += '<option value="' + i + '">' + i + '</option>';
        }
    }

    $selBox.append(optStr);
    $selBox.val('01').prop('selected', true);
}

/** 
 * 일 select box option 생성하기
 * 
 * @params $selBox - option을 추가하기 위한 기준 selectbox 요소(jquery 객체)
 *        selYear - 기준 년도
 *        selMonth - 기준 월
 * @author JG, Jo 
 * @since  2021.05.03
 */
function setDaySelBox($selBox, selYear, selMonth) {
    let lastDay = 31,
        optStr = '';

    if (selMonth == 4 || selMonth == 6 || selMonth == 9 || selMonth == 11) {
        lastDay = 30;
    } else if (selMonth == 2) {
        if ((selYear % 4 == 0 && selYear % 100 != 0) || selYear % 400 == 0) {
            lastDay = 29;
        } else {
            lastDay = 28;
        }
    }

    for (let i = 1; i <= lastDay; i++) {
        if (i < 10) {
            optStr += '<option value="0' + i + '">' + i + '</option>';
        } else {
            optStr += '<option value="' + i + '">' + i + '</option>';
        }
    }

    $selBox.not('[value=""]').empty();
    $selBox.append(optStr);
    $selBox.val('01').prop('selected', true);
}