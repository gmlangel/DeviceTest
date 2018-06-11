    mediaTest = {
        volume: 0,
        stream: '',
        source: '',
        buffer: '',
        gainNode: '',
        audioText: '',
        resolution: {sif: {width: 320, height:240}, vga: {width: 640, height:480},
            hd720p: {width: 1280, height:720}, hd1080p: {width: 1920, height:1080}},
        init: function(){
            var flag = true;
            var os = mediaTest.getOS();
            $('#osVal').html(os);
            var browser = mediaTest.getBrowser();
            var browser_version = mediaTest.getBrowserVersion();
            var error_tip = '<span><img src="./assets/testAbout/testerr.png"></span><span>异常</span>'
            var right_tip = '<span><img src="./assets/testAbout/testok.png"></span><span>正常</span>'
            $('#browserVal').html(browser + '.' + browser_version);
            if (browser == 'Chrome' && browser_version<=56){
                $('#browStatus').html(error_tip);
                flag = false;
            }
            if (browser == 'Chrome' && browser_version>56){
                $('#browStatus').html(right_tip);
            }
            if (browser != 'Chrome'){
                $('#browStatus').html(error_tip)
                flag = false;
            }
            var cookie_enable = mediaTest.chargeCookie();
            if (cookie_enable == 'disabled'){
                $('#cookieVal').html('为启用');
                $('#cookieStatus').html(error_tip);
                flag = false;
            }else{
                $('#cookieVal').html('启用');
                $('#cookieStatus').html(right_tip);
            }
            var screen = mediaTest.getScreen();
            $('#screenVal').html(screen);
            if (!flag){
                this.errorShow();
            }
            this.appendVideo();
            
            //img
            var svalser = [["/doc"]];  //服务
            var is_error = false; //是否异常
            var sport = [["/80"],["/1935"]];
            $.ajax({
            	url:"https://ss0.baidu.com/73F1bjeh1BF3odCf/it/u=1950148752,3183704541&fm=85&s=E89AE5120542454B5ED508DA000080B3",
            	async:false,
            	success:function(data){
            		if(data){
            			svalser.push("/img");
            		}
            	}
            });
            //ci1
            var socketCi1 = io.connect('ws://io-cc1.csslcloud.net:14000');
            if(typeof socketCi1==="object"){
            	svalser.push('/ic1');
            	sport.push('/14000')
            }else{
            	svalser.push('<span class="waringr">/ic1</span>');
            	sport.push('<span class="waringr">/14000</span>');
            	is_error = true;
            }
            //ci2
            var socketCi2 = io.connect('ws://io-cc2.csslcloud.net:14005');
            if(typeof socketCi2==="object"){
            	svalser.push('/ic2');
            	sport.push('/ic2');
            }else{
            	svalser.push('<span class="waringr">/ic2</span>');
            	sport.push('<span class="waringr">/14005</span>');
            	is_error = true;
            }
            $('#serverVal').html(svalser.join(""));
            $('#portVal').html(sport.join(""));
            if(is_error){
                $('#serverStauts').html(error_tip);
                $('#portStauts').html(error_tip);
            }else{
                $('#serverStauts').html(right_tip);
                $('#portStauts').html(right_tip);
            }
            // ip 地址
            if(returnCitySN.cip){
            	$(".ipaddress").html("IP地址："+returnCitySN.cip);
            }
        },
        errorShow: function(){
            $('.topRes img').attr('src', './assets/checkError.png')
            $('.topRes .comment').html('检测到部分设备存在问题，建议您根据提示进行优化操作，以免影响您正常上课。')
        },
        getOS:function(){
            return detectOS();
        },
        getBrowser: function(){
            return BrowserDetect.browser
        },
        getBrowserVersion: function(){
            return BrowserDetect.version
        },
        chargeCookie: function(){
            if(!(document.cookie || navigator.cookieEnabled)){
                return 'disabled';
            }else{
                return 'enable';
            }  
        },
        getScreen: function(){
            return window.screen.width + '*' + window.screen.height;
        },
        createAudioMeter:function(a, b, c, d) {
            var e = a.createScriptProcessor(512);
            return e.onaudioprocess = function(a) {
                a = a.inputBuffer.getChannelData(0);
                for (var b, c = a.length, d = 0, e = 0; e < c; e++)
                    b = a[e], 
                    Math.abs(b) >= this.clipLevel && (this.clipping = !0, 
                    this.lastClip = window.performance.now()),
                    d += b * b;
                this.volume = Math.max(Math.sqrt(d / c), mediaTest.volume * 0.95)
                mediaTest.volume = this.volume;
            }     
            ,     
            e.clipping = !1, 
            e.lastClip = 0,
            e.volume = 0,
            e.clipLevel = b || .98,
            e.averaging = c || .95,
            e.clipLag = d || 750,
            e.connect(a.destination),
            e.checkClipping = function() {
                return !!this.clipping && (this.lastClip + this.clipLag < window.performance.now() && (this.clipping = !1),
                this.clipping)
            },
            e
        },
        showVolume: function(volume){
            if(volume>0.000001){
                var percent = Math.ceil(volume * 20);
                $('.speakerBlock').each(function(i, e){
                    if (i>=percent){
                        return;
                    }
                    $('.speakerTest i').removeClass('hui-color').addClass('green-color')
                    if(percent!=1){
                        $(this).removeClass('hui-back').addClass('green-back')
                    }
                })
            }
        },
        audioConnect:function() {
            if (mediaTest.audioText!=''){
                mediaTest.audioText.close();
            }
            function b(){
                $('.speakerTest i').removeClass('green-color').addClass('hui-color')
                $('.speakerBlock').removeClass('green-back').addClass('hui-back')
                mediaTest.showVolume(mediaTest.volume);
                setTimeout(b, 50);
            }
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            a = new AudioContext;
            mediaTest.audioText = a;
            var d = a.createMediaStreamSource(mediaTest.stream);
            var metr = this.createAudioMeter(a);
            d.connect(metr);
            b();
        },
        audioCallback:function(stream){
            mediaTest.stream = stream;
            mediaTest.audioConnect();
 /*           window.stream = stream; // make stream available to console
            videoElement = document.querySelector("video#myVideo");
            videoElement.src = window.URL.createObjectURL(stream);
            videoElement.play();*/
        },   
        videoCallback:function(stream){
            window.stream = stream; // make stream available to console
            videoElement = document.querySelector("video#mediaVideo");
            videoElement.src = window.URL.createObjectURL(stream);
            videoElement.play();
        },   
        errorCallback:function(error){
                console.log("navigator.getUserMedia error: ", error);
        }   
        ,
        createStream: function(sourceId, type, resolution){
            var resolution = this.resolution[resolution];
            window.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
            
            var error_tip = '<span><img src="./assets/testAbout/testerr.png"></span><span>异常</span>'
            var right_tip = '<span><img src="./assets/testAbout/testok.png"></span><span>正常</span>'
            if(window.getUserMedia){
                $("#webrtcVal").html('支持');
                $("#webrtcStauts").html(right_tip);
            }else{
                $("#webrtcVal").html('不支持');
                $("#webrtcStauts").html(error_tip);
            }
            if(type=='video'){
                if (void 1 != resolution){
                    var video = {
                        optional: [
                            {sourceId: sourceId}, 
                            {minWidth: resolution.width}, 
                            {maxWidth: resolution.width}, 
                            {minHeight: resolution.height},
                            {maxHeight: resolution.height}]
                    }
                }else{
                    var video = {
                        optional: [{sourceId: sourceId}]
                    }
                }
                var constraints = { 
                    video: video
                }
                getUserMedia.call(navigator, constraints, this.videoCallback, this.errorCallback);
            }else{
                var constraints = { 
                    audio: {
                        optional: [{ sourceId: sourceId}]
                    }
                }
                getUserMedia.call(navigator, constraints, this.audioCallback, this.errorCallback);
            }
        }
        ,
        soundTest: function(url) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            var context = new AudioContext();
            var request = new XMLHttpRequest();
            var source = context.createBufferSource(); // creates a sound source
            // Create a gain node.
            var gainNode = context.createGain();
            mediaTest.gainNode = gainNode;
            mediaTest.source = source;
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            // Decode asynchronously
            request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                        source.buffer = buffer;                    // tell the source which sound to play
                        mediaTest.buffer = buffer;
                        // Connect the source to the gain node.
                        source.connect(gainNode);
                        source.loop = true;
                        // Connect the gain node to the destination.
                        gainNode.connect(context.destination);
                        gainNode.gain.value = $('#presenter-slider').slider('value');
                        source.start(0);                           // play the source now
                        }, function(){console.log('get sound error')});
            }
            request.send();
            window.is_soundBegin = true;
        },
        stopSound: function(){
            mediaTest.source.stop();          
            mediaTest.buffer = '';          
            mediaTest.gainNode = '';          
        },
        appendVideo: function(is_init){
            var local_storage = window.localStorage;
            var video_device_id = local_storage.getItem('video_device_id');
            var audio_device_id = local_storage.getItem('audio_device_id');
            var video_device_reso = local_storage.getItem('video_device_resolution');
            var have_store = false;
            if (video_device_id && audio_device_id && video_device_reso){
                have_store = true;
            }
            navigator.mediaDevices.enumerateDevices().then(
                function(devices) {
                    console.log(devices)
                    var i = 0;
                    var j = 0;
                    var k = 0;
                    for (j in devices){
                        var device = devices[j];
                        if(device.label){
	                        var option = '<option value='+device.deviceId+'>'+device.label+'</option>'; 
	                        var option2 = '<option value='+device.deviceId+' selected>'+device.label+'</option>'; 
                        }else{
                        	var option = '<option value='+device.deviceId+'>默认</option>'; 
	                        var option2 = '<option value='+device.deviceId+' selected>默认</option>'; 
                        }
                        //摄像头
                        if (device.kind==='videoinput'&&i!=0){
                            $('.videoSelect').append(option);
                        };
                        if (device.kind==='videoinput'&&i==0){
                            if(!is_init || !have_store){
                                if(video_device_id){
                                    mediaTest.createStream(video_device_id, type='video');
                                }else{
                                    mediaTest.createStream(device.deviceId, type='video');
                                }

                            }
                            $('.videoSelect').append(option2);
                            i = i+1;
                        };
                        //麦克风
                        if (device.kind==='audioinput'&&j!=0){
                            $('.audioSelect').append(option);
                        };
                        if (device.kind==='audioinput'&&j==0){
                            if(!is_init || !have_store){
                                if(audio_device_id){
                                    mediaTest.createStream(audio_device_id, type='audio');
                                }else{
                                    mediaTest.createStream(device.deviceId, type='audio');
                                }

                            }
                            $('.audioSelect').append(option2);
                            j = j+1;
                        };
                        //扬声器
                        if(device.kind==='audiooutput'&&k!=0){
                        	$('.soundTest').append(option);
                        };
                       	if(device.kind==='audiooutput'&&k==0){
                       		if(!is_init || !have_store){
                                mediaTest.createStream(device.deviceId, type='audio');
                            }
                            $('.soundTest').append(option2);
                            k = k+1;
                       	}
                    } 
                    if(i==0){
                        $('.videoSelect .noDevice').removeClass('hide').attr('selected', 'selected')
                        $('.videoSelect').addClass('redcolor')
                    }
                    if(j==0){
                        $('.audioSelect .noDevice').removeClass('hide').attr('selected', 'selected')
                        $('.audioSelect').addClass('redcolor')
                    }
                    if(k==0){
                    	$('.soundTest .noDevice').removeClass('hide').attr('selected', 'selected')
                        $('.soundTest').addClass('redcolor')
                    }
                    if(is_init && have_store){
                        $('.out-box-media .videoSelect').val(video_device_id);
                        $('.out-box-media .audioSelect').val(audio_device_id);
                        $('.out-box-media .resoSelect').val(video_device_reso);
                        mediaTest.createStream(video_device_id, type='video', video_device_reso);
                        mediaTest.createStream(audio_device_id, type='audio', video_device_reso);
                    }
                }   
            ) 
        },
        improveAppendVideo: function(){
            var local_storage = window.localStorage;
            var first_video_device_id = local_storage.getItem('video_device_id');
            var video_device_id = local_storage.getItem('improve_video_device_id');
            var video_device_reso = local_storage.getItem('improve_video_device_resolution');

            var have_store = false;
            if (video_device_id && video_device_reso){
                have_store = true;
            }
            navigator.mediaDevices.enumerateDevices().then(
                function(devices) {
                    console.log(devices);
                    var i = 0;
                    for (var k in devices){
                        var device = devices[k];
                        var deviceLogol = '';
                        var deviceUse = ''
                        if(first_video_device_id === device.deviceId){
                            deviceLogol =  'class="has-use"';
                            deviceUse = '(老师视频正在使用)'
                        }

                        if(device.label){
	                        var option = '<option '+ deviceLogol +' value='+device.deviceId+'>'+device.label + deviceUse + '</option>';
	                        var option2 = '<option '+ deviceLogol +' value='+device.deviceId+' selected>'+device.label + deviceUse + '</option>';
                        }else{
                        	var option = '<option '+ deviceLogol +' value='+device.deviceId+'>默认' + deviceUse + '</option>';
	                        var option2 = '<option '+ deviceLogol +' value='+device.deviceId+' selected>默认' + deviceUse + '</option>';
                        }
                        //摄像头
                        if (device.kind === 'videoinput' && i !== 0){
                            $('.videoSelect').append(option);
                        }
                        if (device.kind === 'videoinput' && i === 0){
                            if(!have_store){
                                if(video_device_id){
                                    mediaTest.createStream(video_device_id, type='video');
                                }else{
                                    mediaTest.createStream(device.deviceId, type='video');
                                }

                            }
                            $('.videoSelect').append(option2);
                            i = i+1;
                        }
                    }
                    if(i === 0){
                        $('.videoSelect .noDevice').removeClass('hide').attr('selected', 'selected');
                        $('.videoSelect').addClass('redcolor');
                    }

                    if(have_store){
                        $('.out-box-media .videoSelect').val(video_device_id);
                        $('.out-box-media .resoSelect').val(video_device_reso);
                        mediaTest.createStream(video_device_id, type='video', video_device_reso);
                    }
                }
            )
        }




    };

    $('#toTest').on('click', function(){
        mediaTest.audioConnect();
    });
    $('#soundTest').on('click', function(){
        $(this).addClass('hide');
        $('#soundTestStop').removeClass('hide');
        mediaTest.soundTest('./assets/testSound.mp3');
    });
    $('#soundTestStop').on('click', function(){
        $(this).addClass('hide');
        $('#soundTest').removeClass('hide');
        mediaTest.stopSound();   
    });
    $( "#presenter-slider" ).slider({
      orientation: "horizontal",
      range: "min",
      max: 50,
      value: 1,
      slide: function(event, ui){
        if(mediaTest.gainNode!=''){
            mediaTest.gainNode.gain.value = ui.value;
        }
      }
    });
    $( "#presenter-slider" ).slider('value', 10);
    $(document).delegate('.videoSelect', 'change', function(){
        var videoSource =  $(this).val();    
        var resolution = $('.resoSelect').val();
        mediaTest.createStream(videoSource, type='video', resolution);
    });
    $(document).delegate('.resoSelect', 'change', function(){
        var resolution =  $(this).val();    
        var videoSource = $('#media .videoSelect').val();
        mediaTest.createStream(videoSource, type='video', resolution);
    });
    $(document).delegate('.audioSelect', 'change', function(){
        var audioSource =  $(this).val();    
        var resolution = $('#media .resoSelect').val();
        mediaTest.createStream(audioSource, type='audio', resolution);
    });
