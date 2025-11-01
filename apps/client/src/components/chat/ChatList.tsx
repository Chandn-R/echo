import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { Conversation, User } from "./ChatPage";
import { useAuth } from "@/context/AuthContext";

interface ChatListProps {
    chats: Conversation[];
    friends: User[];
    onSelectUser: (user: User) => void;
    loading: boolean;
    activeUserId: string | null;
}

const getOtherUser = (users: User[], currentUser: User) => {
    return users.find((u) => u._id !== currentUser._id);
};

export function ChatList({
    chats,
    friends,
    onSelectUser,
    loading,
    activeUserId,
}: ChatListProps) {
    const { user: currentUser } = useAuth();

    const renderContent = () => {
        if (loading) {
            return (
                <div className="p-2 space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            );
        }
        if (!currentUser) {
            return (
                <p className="p-4 text-sm text-gray-500">
                    Please log in to see your chats.
                </p>
            );
        }

        return (
            <div className="space-y-1">
                {chats.length > 0 && (
                    <>
                        {chats.map((convo) => {
                            const otherUser = getOtherUser(
                                convo.users,
                                currentUser
                            );
                            if (!otherUser) return null;

                            return (
                                <Button
                                    key={convo._id}
                                    variant="ghost"
                                    className={`w-full justify-start h-20 p-4 rounded-none text-zinc-100 hover:bg-zinc-800 ${
                                        activeUserId === otherUser._id
                                            ? "bg-zinc-800"
                                            : ""
                                    }`}
                                    onClick={() => onSelectUser(otherUser)}
                                >
                                    <div className="flex items-center space-x-4 w-full">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage
                                                src={
                                                    otherUser.profilePicture
                                                        ?.secure_url
                                                }
                                            />
                                            <AvatarFallback>
                                                {otherUser.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left w-full overflow-hidden">
                                            <p className="font-semibold truncate">
                                                {otherUser.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {convo.latestMessage?.content ||
                                                    "Say hello!"}
                                            </p>{" "}
                                        </div>
                                    </div>
                                </Button>
                            );
                        })}
                    </>
                )}

                {friends.length > 0 && (
                    <>
                        <p className="p-4 text-sm font-semibold text-zinc-400 border-t border-zinc-800 mt-2 pt-4">
                            Start a new chat
                        </p>

                        {friends.map((friend) => (
                            <Button
                                key={friend._id}
                                variant="ghost"
                                className={`w-full justify-start h-20 p-4 rounded-none text-zinc-100 hover:bg-zinc-800 ${
                                    activeUserId === friend._id
                                        ? "bg-zinc-800"
                                        : ""
                                }`}
                                onClick={() => onSelectUser(friend)}
                            >
                                <div className="flex items-center space-x-4 w-full">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={
                                                friend.profilePicture
                                                    ?.secure_url
                                            }
                                        />
                                        <AvatarFallback>
                                            {friend.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left w-full overflow-hidden">
                                        <p className="font-semibold truncate">
                                            {friend.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            @{friend.username}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </>
                )}

                {chats.length === 0 && friends.length === 0 && !loading && (
                    <div className="flex items-center justify-center h-[calc(100%-100px)]">
                        {" "}
                        <p className="text-sm text-gray-500">
                            No chats or friends found.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="rounded-none shadow-none h-full flex flex-col bg-zinc-950 text-zinc-100 border-none">
            <CardHeader className="p-4 border-b border-zinc-800">
                <h2 className="text-2xl font-bold">Chats</h2>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow overflow-y-auto">
                {renderContent()}
            </CardContent>
        </Card>
    );
}
