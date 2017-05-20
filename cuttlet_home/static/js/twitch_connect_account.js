var query_string = location.hash.substring(1);
var query_string = location.hash.substring(1);

var params = {};
var regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(query_string)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    requestChannelId(params);
}

function requestChannelId(params) {
    if (params['access_token']) {
        var xhr = new XMLHttpRequest();
        api_endpoint = 'https://api.twitch.tv/kraken/user?client_id=dyjm5o0cd24spkozqiyy3gue584olj';
        xhr.open('GET', api_endpoint);
        xhr.setRequestHeader("Authorization", "OAuth " + params['access_token']);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log(xhr.response);
                var channel_username = JSON.parse(xhr.response).name;
                updateTwitchChannel(channel_username);
                console.log(channel_username);
            }
        };
        xhr.send(null);
    } else {
        console.log('no access_token found');
    }
}

function updateTwitchChannel(channel_username) {
    var xhr = new XMLHttpRequest();
    var url = window.location.href;
    var params = 'twitch_channel=' + channel_username + '&csrfmiddlewaretoken=' +
                    document.getElementsByName('csrfmiddlewaretoken')[0].value;
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Removes access_token from url and prevents back button action
            history.replaceState('', document.title, '/');
            window.location.reload();
        }
    };
    xhr.send(params);
}
