import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "../SocketProvider";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";

export interface User {
    _id: string;
    name: string;
    username: string;
    profilePicture?: { secure_url: string };
}
export interface Message {
    _id: string;
    sender: User;
    content: string;
    chat: {
        _id: string;
    };
    createdAt: string;
}
export interface Conversation {
    _id: string;
    users: User[];
    isGroupChat: boolean;
    latestMessage?: Message;
}

export function ChatPage() {
    const { user } = useAuth();
    const socket = useSocket();
    const [chats, setChats] = useState<Conversation[]>([]);
    const [friendsToChatWith, setFriendsToChatWith] = useState<User[]>([]);
    const [activeConversation, setActiveConversation] =
        useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingSidebar, setLoadingSidebar] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        const getSidebarData = async () => {
            try {
                setLoadingSidebar(true);
                const response = await api.get("/chat/sidebar");
                setChats(response.data.data.chats);
                setFriendsToChatWith(response.data.data.friendsToChatWith);
            } catch (error) {
                console.error("Failed to fetch sidebar data:", error);
            } finally {
                setLoadingSidebar(false);
            }
        };
        if (user) {
            getSidebarData();
        }
    }, [user]);

    function getOtherUser(users: User[], currentUser: User): User | undefined {
        return users.find((u) => u._id !== currentUser._id);
    }

    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (newMessage: Message) => {
            if (newMessage.chat._id === activeConversation?._id) {
                setMessages((prev) => [...prev, newMessage]);
            }
            setChats((prevChats) =>
                prevChats
                    .map((chat) =>
                        chat._id === newMessage.chat._id
                            ? { ...chat, latestMessage: newMessage }
                            : chat
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                b.latestMessage?.createdAt ?? 0
                            ).getTime() -
                            new Date(a.latestMessage?.createdAt ?? 0).getTime()
                    )
            );
        };
        socket.on("receiveMessage", handleReceiveMessage);
        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [socket, activeConversation]);

    const handleSelectUser = async (selectedUser: User) => {
        try {
            setLoadingMessages(true);
            setMessages([]);
            const chatResponse = await api.post("/chat", {
                userId: selectedUser._id,
            });
            const conversation: Conversation = chatResponse.data.data;
            setActiveConversation(conversation);
            const messagesResponse = await api.get(
                `/message/${conversation._id}`
            );
            setMessages(messagesResponse.data.data);
            socket?.emit("joinRoom", conversation._id);
        } catch (error) {
            console.error("Failed to start chat:", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (messageText: string) => {
        if (!activeConversation) return;
        try {
            const response = await api.post("/message", {
                content: messageText,
                chatId: activeConversation._id,
            });
            const newMessage = response.data.data;
            setMessages((prev) => [...prev, newMessage]);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="h-screen w-full flex bg-zinc-950 text-zinc-100">
            <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 border-r border-zinc-800">
                <ChatList
                    chats={chats}
                    friends={friendsToChatWith}
                    onSelectUser={handleSelectUser}
                    loading={loadingSidebar}
                    activeUserId={
                        activeConversation
                            ? getOtherUser(activeConversation.users, user!)
                                  ?._id ?? null
                            : null
                    }
                />
            </div>
            <div className="w-full flex-grow">
                {activeConversation ? (
                    <ChatWindow
                        key={activeConversation._id}
                        conversation={activeConversation}
                        messages={messages}
                        loading={loadingMessages}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <Card className="rounded-none shadow-none h-full w-full flex items-center justify-center bg-zinc-950 text-zinc-400 border-none">
                        <CardContent className="pt-6">
                            <p>
                                Select a conversation or friend to start
                                chatting.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
