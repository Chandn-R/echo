import { useRef, useEffect } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import type { Conversation, Message, User } from "./ChatPage";
import { Message as MessageComponent } from "./Message";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
    conversation: Conversation;
    messages: Message[];
    loading: boolean;
    onSendMessage: (messageText: string) => void;
}

const getOtherUser = (users: User[], currentUser: User) => {
    return users.find((u) => u._id !== currentUser._id);
};

export function ChatWindow({
    conversation,
    messages,
    loading,
    onSendMessage,
}: ChatWindowProps) {
    const { user: currentUser } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!currentUser) return null;

    const otherUser = getOtherUser(conversation.users, currentUser);

    return (
        <Card className="rounded-none shadow-none h-full flex flex-col bg-zinc-950 text-gray-200">
            <CardHeader className="flex flex-row items-center space-x-4 p-4 border-b border-gray-700">
                <Avatar>
                    <AvatarImage
                        src={otherUser?.profilePicture?.secure_url}
                        alt={otherUser?.name}
                    />
                    <AvatarFallback>
                        {otherUser?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{otherUser?.name}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 space-y-6 overflow-y-auto">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4 bg-gray-700" />
                        <Skeleton className="h-12 w-3/4 ml-auto bg-gray-700" />
                        <Skeleton className="h-12 w-2/4 bg-gray-700" />
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageComponent
                            key={msg._id}
                            message={msg}
                            currentUserId={currentUser._id}
                        />
                    ))
                )}
                <div ref={scrollRef} />
            </CardContent>
            <CardFooter className="p-4 border-t border-gray-700 bg-zinc-950">
                <MessageInput onSendMessage={onSendMessage} />
            </CardFooter>
        </Card>
    );
}
