import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

class App extends Component {
  constructor() {
    super();
    //
  }

  componentDidMount() {
    $(function() {
      let Demo = (function() {
        let _audioTrack;
        let _videoTrack = null;

        let _mediaRecorder;
        let _recordedChunks = [];

        async function _init() {
          await startwithAudio();
          eventBinding();
        }

        function eventBinding() {
          $('#btnMuteUnmute').on('click', function() {
            if (!_audioTrack) return;

            if (_audioTrack.enabled == false) {
              _audioTrack.enabled = true;
              $(this).text('Mute');
            } else {
              _audioTrack.enabled = false;
              $(this).text('Unmute');
            }
            console.log(_audioTrack);
          });
          $('#btnStartReco').on('click', function() {
            setupMediaRecorder();
            _mediaRecorder.start(1000);
          });
          $('#btnPauseReco').on('click', function() {
            _mediaRecorder.pause();
          });
          $('#btnResumeReco').on('click', function() {
            _mediaRecorder.resume();
          });
          $('#btnStopReco').on('click', function() {
            _mediaRecorder.stop();
          });

          $('#btnStartStopCam').on('click', async function() {
            if (_videoTrack) {
              _videoTrack.stop();
              _videoTrack = null;
              document.getElementById('videoCtr').srcObject = null;
              $('#btnStartStopCam').text('Start Camera');
              return;
            }
            try {
              let vstream = await navigator.mediaDevices.getUserMedia({
                video: true
              });
              console.log(vstream);
              if (vstream && vstream.getVideoTracks().length > 0) {
                _videoTrack = vstream.getVideoTracks()[0];
                console.log(_videoTrack);
                document.getElementById('videoCtr').srcObject = new MediaStream(
                  [_videoTrack]
                );
                $('#btnStartStopCam').text('Stop Camera');
              }
            } catch (e) {
              console.log(e);
              return;
            }
          });
        }

        function setupMediaRecorder() {
          let stream = new MediaStream([_audioTrack]);

          if (_videoTrack && _videoTrack.readyState === 'live') {
            stream.addTrack(_videoTrack);
          }

          stream.getTracks().forEach(track => {
            console.log(track);
          });

          _recordedChunks = [];
          _mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm; codecs=vp8,opus'
          });
          _mediaRecorder.ondataavailable = e => {
            console.log(e.data.size);
            if (e.data.size > 0) _recordedChunks.push(e.data);
          };
          _mediaRecorder.onstart = async () => {
            console.log('onstart');
            $('#btnStartReco').hide();
            $('#btnPauseReco').show();
            $('#btnStopReco').show();
            $('#downloadRecording').hide();
          };
          _mediaRecorder.onpause = async () => {
            $('#btnPauseReco').hide();
            $('#btnResumeReco').show();
          };
          _mediaRecorder.onresume = async () => {
            $('#btnResumeReco').hide();
            $('#btnPauseReco').show();
            $('#btnStopReco').show();
          };

          _mediaRecorder.onstop = async () => {
            console.log('onstop');
            let blob = new Blob(_recordedChunks, { type: 'video/webm' });
            let url = window.URL.createObjectURL(blob);

            let videoRecPlayer = document.getElementById('videoCtrRec');
            videoRecPlayer.srcObject = null;
            videoRecPlayer.load();
            videoRecPlayer.src = url;
            videoRecPlayer.play();
            $(videoRecPlayer).show();

            $('#downloadRecording')
              .attr({ href: url, download: 'video.webm' })
              .show();

            $('#btnStartReco').show();
            $('#btnPauseReco').hide();
            $('#btnStopReco').hide();
            //let download = document.getElementById('downloadRecording');
            //download.href = url;
            //download.download = 'test.weba';
            //download.style.display = 'block';
          };
        }

        async function startwithAudio() {
          try {
            let astream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true
            });

            _audioTrack = astream.getAudioTracks()[0];

            _audioTrack.onmute = function(e) {
              console.log(e);
            };
            _audioTrack.onunmute = function(e) {
              console.log(e);
            };

            _audioTrack.enabled = false;
          } catch (e) {
            console.log(e);
            return;
          }
        }

        return {
          init: async function() {
            await _init();
          }
        };
      })();
      console.log('a');
      Demo.init();
    });
  }

  render() {
    return (
      <>
        <h1>Hello</h1>
        <video autoPlay muted controls id="videoCtr" width="480" height="320" />
        <video
          // className="vid"
          autoPlay
          controls
          id="videoCtrRec"
          width="480"
          height="320"
        />
        <button id="btnMuteUnmute">UnMute</button>
        <button id="btnStartStopCam">Start Camera</button>
        <button id="btnStartReco">Start Recording</button>
        <button id="btnPauseReco">Pause</button>
        <button id="btnResumeReco">Resume</button>
        <button id="btnStopReco">Stop</button>
        <a id="downloadRecording">Download</a>;
      </>
    );
  }
}

export default App;
