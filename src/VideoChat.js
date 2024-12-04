import React, { useRef, useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr';

const VideoChat = () => {
    const [connection, setConnection] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        // Initialize SignalR connection
        const newConnection = new HubConnectionBuilder()
        .withUrl('https://localhost:7064/videocallhub')  // Ensure this matches your backend endpoint
        // .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()  // Automatically try to reconnect
        .build();

        // const newConnection = new signalR.HubConnectionBuilder()
        //     .withUrl("https://localhost:7064/videocallhub", {
        //         transport: signalR.HttpTransportType.WebSockets |
        //             signalR.HttpTransportType.ServerSentEvents |
        //             signalR.HttpTransportType.LongPolling
        //     })
        //     .withAutomaticReconnect()
        //     .configureLogging(signalR.LogLevel.Information)
        //     .build();

        newConnection.serverTimeoutInMilliseconds = 100000; // 100 seconds, adjust as needed


        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                console.log('Connected to SignalR for Video call...');
            })
            .catch(err => console.log('Error while connecting to SignalR: ', err));

        newConnection.on('ReceiveOffer', async (offer) => {
            console.log("ReceiveOffer", offer);
            console.log("peerConnection", peerConnection);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                newConnection.invoke('SendAnswer', answer);
            }
        });

        newConnection.on('ReceiveAnswer', async (answer) => {
            console.log("ReceiveAnswer--", answer);
            console.log("peerConnection--", peerConnection);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        newConnection.on('ReceiveIceCandidate', async (candidate) => {
            console.log("ReceiveIceCandidate----", candidate);
            console.log("peerConnection----", peerConnection);
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            newConnection.stop();
        };
    }, [peerConnection]);

    useEffect(() => {
        if (connection) {
            connection.onreconnecting(error => {
                console.warn(`Connection lost due to error "${error}". Reconnecting...`);
            });
    
            connection.onreconnected(connectionId => {
                console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
            });
    
            connection.onclose(error => {
                console.error(`Connection closed due to error "${error}".`);
            });
        }
    }, [connection]);
    
    const startCall = async () => {
        try {
            // Ensure the SignalR connection is started
            if (connection.state !== 'Connected') {
                console.log('Connection not established yet. Waiting for connection...');
                await connection.start();
                console.log('Connection established.');
            }
    
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }
    
            const pc = new RTCPeerConnection();
            setPeerConnection(pc);
    
            // Add local stream tracks to peer connection
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    
            // Handle incoming remote stream
            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
    
            // Exchange ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate && connection.state === 'Connected') {
                    connection.invoke('SendIceCandidate', event.candidate)
                        .catch(err => console.error('Error sending ICE candidate:', err));
                }
            };
    
            // Create an offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
    
            // Ensure connection is still connected before invoking server method
            if (connection.state === 'Connected') {
                await connection.invoke('SendOffer', offer);
            } else {
                console.error('Connection lost. Cannot send offer.');
            }
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };
    

    return (
        <div>
            <div>
                <h2>Local Video</h2>
                <video ref={localVideoRef} autoPlay muted style={{ width: '400px', height: '300px' }}></video>
            </div>
            <div>
                <h2>Remote Video</h2>
                <video ref={remoteVideoRef} autoPlay style={{ width: '400px', height: '300px' }}></video>
            </div>
            <button onClick={startCall}>Start Call</button>
        </div>
    );
};

export default VideoChat;