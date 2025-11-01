import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip } from "lucide-react";

interface MessageInputProps {
    onSendMessage: (message: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;
        onSendMessage(newMessage);
        setNewMessage("");
    };

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex items-center w-full space-x-2"
        >
            <Button variant="ghost" size="icon" type="button">
                <Paperclip className="h-5 w-5" />
            </Button>
            <Input
                placeholder="Type a message..."
                className="flex-grow"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                autoComplete="off"
            />
            <Button type="submit" size="icon">
                <Send className="h-5 w-5" />
            </Button>
        </form>
    );
}
