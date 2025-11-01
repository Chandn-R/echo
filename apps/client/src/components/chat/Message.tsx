import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message as MessageType } from "./ChatPage";

interface MessageProps {
    message: MessageType;
    currentUserId: string;
}

export function Message({ message, currentUserId }: MessageProps) {
    const isMe = message.sender._id === currentUserId;

    const senderName = message.sender.name;
    const senderAvatarUrl = message.sender.profilePicture?.secure_url;

    return (
        <div
            className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
            }`}
        >
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={senderAvatarUrl} alt={senderName} />
                    <AvatarFallback>
                        {senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            )}
            <div
                className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 break-words ${
                    isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                }`}
            >
                <p>{message.content}</p>
            </div>
        </div>
    );
}
