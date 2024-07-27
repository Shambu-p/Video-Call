
let main_video;
let mediaStream;
let cameraState = true;
let buttons = {};
let socket;
let participants = [];
let currentCall;

const ActionTypes = {
    NewCallParticipant: "new_participant",
    NewICECandidate: "new_ice_candidate",
    LeaveCall: "leave_call",
    StartCall: "start_call"
};

window.onload = async () => {

    socket = new ZewdSocket();
    socket.connect("ws://localhost:7000");
    
    socket.setHandler("create_call", (data) => {
        currentCall = data;
        buttons.call.style.display = "none";
        buttons.end_call.style.display = "";
    });

    main_video = document.getElementById("main_video");
    main_video.addEventListener("loadedmetadata", () => {
        main_video.play();
    });

    buttons.mute = document.getElementById("mute_button");
    buttons.mute.addEventListener("click", () => {
        buttons.mute.innerHTML = main_video.muted ? "Mute" : "Unmute";
        mediaStream.getAudioTracks().forEach(track => {track.enabled = main_video.muted});
        main_video.muted = !main_video.muted;
        // alert("clicked");
    });

    buttons.camera = document.getElementById("camera_button");
    buttons.camera.addEventListener("click", () => {
        buttons.camera.innerHTML = cameraState ? "On" : "Off";
        mediaStream.getVideoTracks().forEach(track => {track.enabled = !cameraState});
        cameraState = !cameraState;
        // alert("clicked");
    });
    
    buttons.call = document.getElementById("call_button");
    buttons.end_call = document.getElementById("end_call_button");

    buttons.call.addEventListener("click", () => {
        socket.emit("create_call", {});
        // alert("working");
    });


    // await getMedia();
    // main_video.srcObject = mediaStream;
    // console.log("video tracks", mediaStream.getVideoTracks());

};

async function getMedia() {
    try {
        mediaStream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
    } catch(error){
        console.log(error.message);
    }
}

const createPeerConnection = async (offerObj) => {
    //RTCPeerConnection is the thing that creates the connection
    //we can pass a config object, and that config object can contain stun servers
    //which will fetch us ICE candidates
    let peerConnection = new RTCPeerConnection(peerConfiguration)
    // remoteStream = new MediaStream()
    // remoteVideoEl.srcObject = remoteStream;


    mediaStream.getTracks().forEach(track=>{
        //add localtracks so that they can be sent once the connection is established
        peerConnection.addTrack(track, mediaStream);
    })

    peerConnection.addEventListener("signalingstatechange", (event) => {
        console.log(event);
        console.log(peerConnection.signalingState)
    });

    peerConnection.addEventListener('icecandidate',e=>{
        console.log('........Ice candidate found!......')
        console.log(e)
        if(e.candidate){
            socket.emit(ActionTypes.NewICECandidate, {
                iceCandidate: e.candidate,
                callId: currentCall.sys_id
            });
        }
    })
    
    peerConnection.addEventListener('track',e=>{
        console.log("Got a track from the other peer!! How excting")
        console.log(e)
        e.streams[0].getTracks().forEach(track=>{
            remoteStream.addTrack(track,remoteStream);
            console.log("Here's an exciting moment... fingers cross")
        })
    })

    if(offerObj) {
        //this won't be set when called from call();
        //will be set when we call from answerOffer()
        // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
        await peerConnection.setRemoteDescription(offerObj.offer)
        // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
    }

    return peerConnection;
}