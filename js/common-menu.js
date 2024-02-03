function getMyInfo(token, id) {
    $.ajax({
        type: "GET",
        url: `${getUrl()}/api/v1/users/${id}`,
        headers: {
            "Authorization": token
        },
        success: function (data) {
            let info = data.data;
            $("#info-email").text(info.email);
            $("#info-name").text(info.name);
            $("#info-nickname").text(info.nickname);
            $("#info-birth").text(info.birth);
            $("#info-phone").text(info.phoneNumber);
        },
        error: function (jqXHR, textStatus) {
            console.log(jqXHR);
            console.error(textStatus);
        },
    })
}

function verificationPhone() {
    let phoneNumber = $("#update-phone").val();
    $.ajax({
        type: "POST",
        url: `${getUrl()}/api/v1/auth/sms`,
        contentType: "application/json",
        data: JSON.stringify({
            to: phoneNumber
        }),
        success: function (response) {
            let endTime = new Date(response.data);
            $("#update-verification-btn").addClass("disabled");
            okAlert("인증 번호를 발송했습니다.");
            displayRemainingTimeOfUpdate(endTime);
        },
        error: function (jqXHR, textStatus) {

            let response = jqXHR.responseJSON;
            if (response.data) {
                let data = response.data;
                if (data.to) {
                    $("#update-phoneNumber-span").text(data.to);
                }
            }
            if (response.message) {
                if (response.code.substring(2, 4) === "07") {
                    $("#update-verificationNumber-span").text(response.message);
                }
            }
        },
    });
}

function updateUserInfo(token, id) {
    let nickname = $("#update-nickname").val();
    let phoneNumber = $("#update-phone").val();
    let verificationNumber = $("#update-verificationCode").val();

    $.ajax({
        type: "PUT",
        url: `${getUrl()}/api/v1/users/${id}`,
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: JSON.stringify({
            nickname: nickname,
            phoneNumber: phoneNumber,
            verificationNumber: verificationNumber
        }),
        success: function (data) {
            okAlert("회원 정보를 수정했습니다.")
            movePageWithToken(`/user/user-info.html`);
        },
        error: function (jqXHR, textStatus) {
            resetValidationMessages();
            let response = jqXHR.responseJSON;
            if (response) {
                if (response.code.substring(2, 4) === "04") {
                    $("#update-nickname-span").text(response.message);
                }
                if (response.code.substring(2, 4) === "06") {
                    $("#update-phoneNumber-span").text(response.message);
                }
                if (response.code.substring(2, 4) === "07") {
                    $("#update-verificationNumber-span").text(response.message);
                }
            }
        }
    });
}

function resetValidationMessages() {
    $("#update-nickname-span, #update-phoneNumber-span, #update-verificationNumber-span")
        .text("");
}

let readyToUpdate = false;

function checkPasswordMatch() {
    let password = $(".password").val();
    let confirmPassword = $(".password-check").val();
    let messageElement = $(".passwordMatchMessage");


    // 비밀번호와 비밀번호 확인 값이 동일한지 확인
    if (password === confirmPassword) {
        messageElement.text("비밀번호가 일치합니다.").css("color", "green")
            .removeClass("password-mismatch").addClass("password-match");
        readyToUpdate = true;
    } else {
        messageElement.text("비밀번호가 일치하지 않습니다.").css("color", "red")
            .removeClass("password-match").addClass("password-mismatch");
        readyToUpdate = false;
    }
}

function updatePassword(token, id) {
    let password = $("#update-password").val();

    $.ajax({
        type: "PATCH",
        url: `${getUrl()}/api/v1/users/${id}`,
        contentType: 'application/json',
        headers: {
            "Authorization": token
        },
        data: JSON.stringify({
            password: password
        }),
        success: function (data) {
            okAlert("비밀 번호 변경이 완료되었습니다.");
            movePageWithToken(`/user/user-info.html`);
        },
        error: function (jqXHR, textStatus) {
            resetValidationMessages();
            let response = jqXHR.responseJSON;
            if (response.data) {
                $("#update-password-span").text(response.data.password);
            }
            if (response) {
                if (response.code.substring(2, 4) === "02") {
                    $("#update-password-span").text(response.message);
                }

            }
        }
    });
}

function withdrawUser(token) {
    let password = $("#delete-password").val();

    $.ajax({
        type: "DELETE",
        url: `${getUrl()}/api/v1/users`,
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: JSON.stringify({
            password: password
        }),
        success: function (data) {
            okAlert('탈퇴가 완료되었습니다.');
            requestLogout();
        },
        error: function (jqXHR, textStatus) {
            let response = jqXHR.responseJSON;
            if (response) {
                if (response.code.substring(2, 4) === "02") {
                    $("#delete-password-span").text(response.message);
                }
            }
        }
    });
}

function getPointChargeList(token, page) {
    $.ajax({
        type: "GET",
        url: `${getUrl()}/api/v1/points/charge?page=${page}`,
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: {
            "page": page
        },
        success: function (data) {
            $(".list-tb-body").empty();
            $(".pagination").empty();

            if (data.code === "P00000" && data.data.content) {
                displayData(data.code, data.data);
            }
        },
        error: function (jqXHR, textStatus) {
            errorAlert("포인트 충전 목록 조회에 오류가 발생했습니다.");
        },
    });
}

function getPointList(token, page) {
    $.ajax({
        type: "GET",
        url: `${getUrl()}/api/v1/points/change?page=${page}`,
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: {
            "page": page
        },
        success: function (data) {
            $(".list-tb-body").empty();
            $(".pagination").empty();

            if (data.code === "P00001" && data.data.content) {
                displayData(data.code, data.data);
            }
        },
        error: function (jqXHR, textStatus) {
            errorAlert("포인트 목록 조회에 오류가 발생했습니다.");
        },
    });
}

function displayData(code, data) {
    let size = data.pageable.pageSize;
    let curIndex = data.number;
    for (let i = 0; i < data.content.length; i++) {
        let id = $('<td>').text(size * curIndex + (i + 1));
        let date = $('<td>').text(data.content[i].time);
        let amount = $('<td>').text(data.content[i].amount.toLocaleString() + "원");
        let content;
        if (code === 'P00000') {
            content = $('<td>').text(data.content[i].orderId);
        } else {
            content = $('<td>').text(data.content[i].type);
        }

        let tr = $('<tr>').append(id).append(content).append(date).append(amount);
        $(".list-tb-body").append(tr);
    }


    let totalPage = data.totalPages;
    let currentPage = data.number + 1; // 현재 페이지는 0부터 시작하는데, 표시는 1부터 시작하므로 +1

    const displayRange = 3; // 현재 페이지를 중심으로 보여질 페이지 범위

    let startPage = Math.max(1, currentPage - displayRange); // 시작 페이지
    let endPage = Math.min(totalPage, currentPage + displayRange); // 끝 페이지

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = i;
        let link = $('<a>');
        link.addClass('list-a');
        link.attr('href', '#');
        link.text(pageNumber);

        if (i === currentPage) {
            link.addClass('now');
        }

        if (code === 'P00000') {
            link.on("click", function () {
                reissueToken((token => {
                        getPointChargeList(token, i - 1);
                    }
                ));
            });
        } else {
            link.on("click", function () {
                reissueToken((token => {
                        getPointList(token, i - 1);
                    }
                ));
            });
        }

        $(".pagination").append(link);
    }

// '<' 표시
    if (startPage > 1) {
        let prevLink = $('<a>');
        prevLink.addClass('list-a');
        prevLink.attr('href', '#');
        prevLink.text('<');

        if (code === 'P00000') {
            prevLink.on("click", function () {
                reissueToken((token => {
                        getPointChargeList(token, startPage - displayRange - 2);
                    }
                ));
            });
        } else {
            prevLink.on("click", function () {
                reissueToken((token => {
                        getPointList(token, startPage - displayRange - 2);
                    }
                ));
            });
        }

        $(".pagination").prepend(prevLink);
    }

// '>' 표시
    if (endPage < totalPage) {
        let nextLink = $('<a>');
        nextLink.addClass('list-a');
        nextLink.attr('href', '#');
        nextLink.text('>');

        if (code === 'P00000') {
            nextLink.on("click", function () {
                reissueToken((token => {
                        getPointChargeList(token, endPage);
                    }
                ));
            });
        } else {
            nextLink.on("click", function () {
                reissueToken((token => {
                        getPointList(token, endPage);
                    }
                ));
            });
        }

        $(".pagination").append(nextLink);
    }
}

function displayRemainingTimeOfUpdate(endTime) {
    let now = new Date();
    let timeDiff = endTime - now;

    if (timeDiff <= 0) {
        $("#update-remaining-time").empty();
        $("#update-verification-btn").removeClass("disabled");
    } else {
        // 남은 시간을 초로 변환
        let secondsRemaining = Math.floor(timeDiff / 1000);

        // 분과 초 계산
        let minutes = Math.floor(secondsRemaining / 60);
        let seconds = secondsRemaining % 60;

        // 시간 표시를 위해 2자리로 포맷팅
        let formattedTime = `${padZero(minutes)}:${padZero(seconds)}`;

        // 화면에 남은 시간 표시
        $("#update-remaining-time").text(`  ${formattedTime}`);

        setTimeout(function () {
            displayRemainingTimeOfUpdate(endTime);
        }, 1000);
    }
}
