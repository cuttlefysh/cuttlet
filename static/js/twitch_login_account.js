location.search&&window.location.replace("/");for(var query_string=location.hash.substring(1),params={},regex=/([^&=]+)=([^&]*)/g,m;m=regex.exec(query_string);)params[decodeURIComponent(m[1])]=decodeURIComponent(m[2]),requestChannelInfo(params);function decodeJwt(a){a=a.split(".")[1].replace("-","+").replace("_","/");return JSON.parse(window.atob(a))}
function requestChannelInfo(a){if(a.id_token&&a.scope&&(a=decodeJwt(a.id_token).sub)){var b=new XMLHttpRequest;api_endpoint="https://api.twitch.tv/kraken/channels/"+a;b.open("GET",api_endpoint);b.setRequestHeader("Accept","application/vnd.twitchtv.v5+json");b.setRequestHeader("Client-ID","jyxzi98m2x4l2cho0gairq05gsb3uq");b.onreadystatechange=function(a){if(4==b.readyState&&200==b.status&&b.responseText){a=JSON.parse(b.response)._id;var c=JSON.parse(b.response).name,d=JSON.parse(b.response).logo;d||
(d="");loginTwitchChannel(a,c,d)}};b.send(null)}}function loginTwitchChannel(a,b,e){var c=new XMLHttpRequest,d=window.location.href;a="twitch_id="+a+"&channel_name="+b+"&thumbnail_url="+e+"&csrfmiddlewaretoken="+document.getElementsByName("csrfmiddlewaretoken")[0].value;c.open("POST",d);c.setRequestHeader("Content-type","application/x-www-form-urlencoded");c.onreadystatechange=function(a){4==c.readyState&&200==c.status&&window.location.replace("/")};c.send(a)};
