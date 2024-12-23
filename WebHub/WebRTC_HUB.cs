using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MonitorRTC.WebHub
{
    public class WebRTCHub : Hub
    {
        // This method will be used by Client 1 to request an offer
        public async Task RequestConnection()
        {
            // Notify all clients except the caller that Client 1 is looking for a connection
            await Clients.Others.SendAsync("Client1LookingForConnection");
        }

        // Send an offer to all connected clients except the sender
        public async Task SendOffer(string peerId, SessionDescription offer)
        {
            // Send the offer to all other clients
            await Clients.Others.SendAsync("ReceiveOffer", peerId, offer);
        }

        // Send an answer to all connected clients except the sender
        public async Task SendAnswer(string peerId, SessionDescription answer)
        {
            // Send the answer to all other clients
            await Clients.Others.SendAsync("ReceiveAnswer", peerId, answer);
        }

        // Send an ICE candidate to all connected clients except the sender
        public async Task SendIceCandidate(string peerId, RTCIceCandidate candidate)
        {
            // Send the ICE candidate to all other clients
            await Clients.Others.SendAsync("ReceiveIceCandidate", peerId, candidate);
        }

        // This method checks for new peers and sends a notification
        public async Task CheckForNewPeers()
        {
            // Send a notification to all connected clients that Client 1 is checking for new peers
            await Clients.All.SendAsync("NewPeerCheck");
        }

        // Method to notify all clients that Client 1 has successfully connected to another client
        public async Task NotifyConnectionEstablished()
        {
            await Clients.All.SendAsync("ConnectionEstablished");
        }
    }

    // Class representing the session description (offer/answer)
    public class SessionDescription
    {
        public string Type { get; set; }  // "offer" or "answer"
        public string Sdp { get; set; }   // The SDP string
    }

    // Class representing an ICE candidate
    public class RTCIceCandidate
    {
        public string Candidate { get; set; }
        public string SdpMid { get; set; }
        public int SdpMLineIndex { get; set; }
    }
}
