import { makeAutoObservable, runInAction } from "mobx";
import * as signalR from "@microsoft/signalr";

class ChatStore {
  user = localStorage.getItem("user") || "";
  messages = [];
  connection = null;
  isConnected = false;
  firstMessageSent = false;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem("user", user);
  }

  async connect() {
    const connect = new signalR.HubConnectionBuilder()
      // .withUrl("https://poc-chat-api.azurewebsites.net/chathub", {
        .withUrl("https://localhost:7064/chathub", {
        transport: signalR.HttpTransportType.WebSockets |
                   signalR.HttpTransportType.ServerSentEvents |
                   signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connect.serverTimeoutInMilliseconds = 100000; // 100 seconds, adjust as needed

    try {
      await connect.start();
      runInAction(() => {
        this.connection = connect;
        this.isConnected = true;
      });

      // Retrieve chat history on connection
      const history = await connect.invoke("GetChatHistory");
      runInAction(() => {
        this.messages = history.map((entry) => {
          const [user, message, timestamp] = entry.split("~");
          return { user, message, timestamp };
        });
      });

      connect.on("ReceiveMessage", (user, message, timestamp) => {
        runInAction(() => {
          this.messages.push({ user, message, timestamp });
        });
      });

      connect.onreconnected(() => {
        runInAction(() => {
          this.isConnected = true;
        });
      });

      connect.onclose(() => {
        runInAction(() => {
          this.isConnected = false;
        });
      });
    } catch (error) {
      console.error("Connection failed: ", error);
    }
  }

  async sendMessage(message) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke("SendMessage", this.user, message);
        runInAction(() => {
          this.firstMessageSent = true;
        });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  }

  async sendImage(base64Image) {
    if (this.isConnected && this.connection) {
      try {
        await this.connection.invoke("SendMessage", this.user, base64Image);
      } catch (error) {
        console.error("Error sending image: ", error);
      }
    }
  }
}

const chatStore = new ChatStore();
export default chatStore;
