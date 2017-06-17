function CuttleChat() {
    var is_open = false;
    switch(localStorage.getItem('use_connected_account')){
        case 'twitch':
            this.chat = new twitchChat(localStorage.getItem('twitch_channel'));
            break;
        case 'youtube':
            this.chat = new youtubeChat(localStorage.getItem('youtube_live_id'));
            break;
    }
}

CuttleChat.prototype.open = function open(callback) {
    this.chat.is_open = true;
    this.chat.callback = callback;
    console.log('opening');
    this.chat.open();
}

CuttleChat.prototype.close = function close() {
    this.is_open = false;
    this.chat.close();
}

// Twitch starts here
// ------------------
// ------------------
// ------------------
// ------------------

var twitchChat = function twitchChat(channel) {
    console.log(channel);
    this.channel = '#' + channel;

    this.username = 'cuttlebay';
    this.password = 'oauth:lvflu1lbn7ewjo3qx2na7jyvc8a9yh';
    this.server = 'irc-ws.chat.twitch.tv';
    this.port = 443;
}

twitchChat.prototype.open = function open() {
    this.webSocket = new WebSocket('wss://' + this.server + ':' + this.port + '/', 'irc');

    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
    this.webSocket.onopen = this.onOpen.bind(this);
}

twitchChat.prototype.onError = function onError(message) {
    console.log('Error: ' + message);
}

twitchChat.prototype.onMessage = function onMessage(message) {
    if(message !== null) {
        console.log(message.data);
        var parsed = this.parseMessage(message.data);
        // if (parsed) checks for null, undefined, emptystring, nan, 0, false
        if(parsed) {
            console.log('NOTSAVED: ' + parsed.message);
            this.callback(parsed.username, parsed.message);
        }
    }
}

twitchChat.prototype.onOpen = function onOpen() {
    var socket = this.webSocket;

    if (socket !== null && socket.readyState === 1) {
        console.log('Connecting and authenticating...');

        socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        socket.send('PASS ' + this.password);
        socket.send('NICK ' + this.username);
        socket.send('JOIN ' + this.channel);
    }
}

twitchChat.prototype.onClose = function onClose() {
    console.log(this.is_open);
    if(this.is_open) {
        console.log('reconnecting...');
        this.open();
    } else {
        console.log('Disconnected from the chat server.');
    }
}

twitchChat.prototype.close = function close() {
    this.is_open = false;
    if(this.webSocket) {
        this.webSocket.close();
    }
}

twitchChat.prototype.parseMessage = function parseMessage(rawMessage) {
    var parsedMessage = {
        message: null,
        tags: null,
        command: null,
        original: rawMessage,
        channel: null,
        username: null
    };

    if(rawMessage[0] === '@') {
        var tagIndex = rawMessage.indexOf(' '),
        userIndex = rawMessage.indexOf(' ', tagIndex + 1),
        commandIndex = rawMessage.indexOf(' ', userIndex + 1),
        channelIndex = rawMessage.indexOf(' ', commandIndex + 1),
        messageIndex = rawMessage.indexOf(':', channelIndex + 1);

        parsedMessage.tags = rawMessage.slice(0, tagIndex);
        parsedMessage.username = rawMessage.slice(tagIndex + 2, rawMessage.indexOf('!'));
        parsedMessage.command = rawMessage.slice(userIndex + 1, commandIndex);
        parsedMessage.channel = rawMessage.slice(commandIndex + 1, channelIndex);
        parsedMessage.message = rawMessage.slice(messageIndex + 1);
    }

    if(parsedMessage.command !== 'PRIVMSG') {
        parsedMessage = null;
    }

    return parsedMessage;
}

// YoutubeChat starts here
// ---------------------
// ---------------------
// ---------------------
// ---------------------

var youtubeChat = function youtubeChat(id) {
    console.log(id);
    this.id = id;
    this.chat_id = 'none';
    this.next_token = '';
}

youtubeChat.prototype.open = function open() {
    console.log(this.id);
    console.log('youtube opening');
    this.is_open = true;
    var self = this;
    var xhr = new XMLHttpRequest();
    var url = 'https://www.googleapis.com/youtube/v3/videos?';
    var params =    'id=' + this.id + "&" +
                    'part=liveStreamingDetails' + '&' +
                    'key=AIzaSyAdCxzlvqQS1653t0sAB4STdHbP2fzvr1E';
    xhr.open('GET', url + params);
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var r = JSON.parse(xhr.response);
            console.log(r);
            self.chat_id = r.items[0].liveStreamingDetails.activeLiveChatId;
            self.listMessages(self.next_token);
        }
    }
    xhr.send(null);
}

youtubeChat.prototype.close = function close() {
    this.is_open = false;
}

youtubeChat.prototype.listMessages = function listMessages(page_token) {
    if (this.is_open) {
        var self = this;
        var xhr = new XMLHttpRequest();
        var url = 'https://www.googleapis.com/youtube/v3/liveChat/messages?';
        var params =    'liveChatId=' + this.chat_id + "&" +
                        'part=snippet,authorDetails' + '&' +
                        'profileImageSize=16' + '&' +
                        'pageToken=' + page_token + '&' +
                        'key=AIzaSyAdCxzlvqQS1653t0sAB4STdHbP2fzvr1E';
        xhr.open('GET', url + params);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var r = JSON.parse(xhr.response);
                console.log(r);
                self.parseMessages(r.items);
                self.next_token = r.nextPageToken;
                setTimeout(function () {
                    self.listMessages(self.next_token);
                }, r.pollingIntervalMillis);
            }
        }
        xhr.send(null);
    }
}

youtubeChat.prototype.parseMessages = function parseMessages(items) {
    for(var i = 0; i < items.length; i++) {
        if (this.is_open && items[i].snippet.displayMessage) {
                console.log('NOTSAVED: ' + items[i].snippet.displayMessage + ' : ' + items[i].authorDetails.displayName);
                this.callback(items[i].authorDetails.displayName, items[i].snippet.displayMessage);
        }
    }
}
