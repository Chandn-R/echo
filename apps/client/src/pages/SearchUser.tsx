import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "@/services/api";
import debounce from "lodash.debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Users, Loader2, Search, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
    _id: string;
    username: string;
    email: string;
    name: string;
    profilePicture: {
        secure_url: string;
    };
}

const limit = 10;

const SearchUser: React.FC = () => {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [lastId, setLastId] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [showInputSpinner, setShowInputSpinner] = useState(false);

    const observerRef = useRef<HTMLDivElement>(null);
    const fetchingNextPageRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchUsers = useCallback(
        async (
            searchQuery: string,
            cursor: string | null,
            append: boolean = false
        ) => {
            if (!append) {
                setLoading(true);
                setShowInputSpinner(true);
            } else if (loading) {
                return;
            }

            if (append) {
                setLoading(true);
            }

            try {
                const res = await api.get("/users/search", {
                    params: {
                        query: searchQuery.trim(),
                        limit,
                        lastId: cursor,
                    },
                });

                const { users: newUsers, pagination } = res.data.data;

                setUsers((prev) =>
                    append ? [...prev, ...newUsers] : newUsers
                );
                setLastId(pagination.lastId);
                setHasMore(pagination.hasNextPage);

                if (initialLoad) setInitialLoad(false);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
                fetchingNextPageRef.current = false;
                setIsTyping(false);
                setShowInputSpinner(false);
            }
        },
        [loading, initialLoad]
    );

    const debouncedSearch = useCallback(
        debounce((searchQuery: string) => {
            setIsTyping(false);
            setUsers([]);
            setLastId(null);
            setHasMore(true);
            fetchUsers(searchQuery, null);
        }, 400),
        [fetchUsers]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsTyping(true);
        setShowInputSpinner(true);

        if (value.trim() === "") {
            clearSearch(false);
            debouncedSearch.cancel();
            setShowInputSpinner(false);
        } else {
            debouncedSearch(value);
        }
    };

    const clearSearch = (shouldFocus: boolean = true) => {
        setQuery("");
        setUsers([]);
        setLastId(null);
        setHasMore(true);
        setIsTyping(false);
        setShowInputSpinner(false);
        debouncedSearch.cancel();
        setInitialLoad(true);

        if (shouldFocus) {
            inputRef.current?.focus();
        }
    };

    useEffect(() => {
        if (initialLoad) {
            fetchUsers("", null);
        }
        return () => debouncedSearch.cancel();
    }, [debouncedSearch, initialLoad, fetchUsers]);

    useEffect(() => {
        if (initialLoad || !hasMore || loading) return;

        const currentRef = observerRef.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    !fetchingNextPageRef.current &&
                    !isTyping &&
                    query.trim().length > 0
                ) {
                    fetchingNextPageRef.current = true;
                    fetchUsers(query, lastId, true);
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
            observer.disconnect();
        };
    }, [query, lastId, hasMore, loading, initialLoad, isTyping, fetchUsers]);

    return (
        <div className="flex-1 min-h-screen p-4 mx-auto max-w-4xl space-y-6">
            <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    User Directory
                                </h1>
                            </div>

                            {!isTyping && !loading && users.length > 0 && (
                                <Badge
                                    variant="outline"
                                    className="px-3 py-1 text-sm"
                                >
                                    {users.length}{" "}
                                    {users.length === 1 ? "result" : "results"}
                                </Badge>
                            )}
                        </div>

                        <div className="relative">
                            {showInputSpinner ? (
                                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                            ) : (
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            )}
                            <Input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={handleSearchChange}
                                placeholder="Search by name, username, or email..."
                                className="w-full pl-10 pr-10 h-11"
                            />
                            {query && (
                                <button
                                    onClick={() => clearSearch()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted transition-colors"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            )}
                            {isTyping && query.length > 0 && (
                                <p className="absolute -bottom-6 left-0 text-xs text-muted-foreground animate-pulse">
                                    Searching...
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="border-b p-4 bg-muted/50">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {query ? "Search Results" : "All Users"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {(initialLoad && loading) ||
                    (isTyping && users.length === 0 && query.length > 0) ? (
                        <div className="divide-y">
                            {[...Array(limit)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-4 animate-pulse"
                                >
                                    <div className="h-10 w-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                                    </div>
                                    <div className="h-8 w-24 bg-gray-200 rounded dark:bg-gray-700"></div>
                                </div>
                            ))}
                        </div>
                    ) : users.length > 0 ? (
                        <div className="divide-y">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage
                                                    src={
                                                        user.profilePicture
                                                            ?.secure_url
                                                    }
                                                    alt={user.name}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-muted font-medium">
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            View {user.name}'s profile
                                        </TooltipContent>
                                    </Tooltip>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-base truncate">
                                                {user.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="truncate">
                                                @{user.username}
                                            </span>
                                            <span className="text-gray-400">
                                                •
                                            </span>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1 truncate">
                                                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {user.email}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="shrink-0"
                                    >
                                        View Profile
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !initialLoad &&
                        !loading &&
                        !isTyping && (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">
                                    {query
                                        ? "No matching users found"
                                        : "No users available"}
                                </h3>
                                <p className="text-muted-foreground mt-2 max-w-md">
                                    {query
                                        ? `We couldn't find any users matching "${query}". Try a different search term or check your spelling.`
                                        : "There are currently no users in the directory. Users will appear here once added."}
                                </p>
                            </div>
                        )
                    )}

                    {loading && !initialLoad && users.length > 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Loading more users...
                            </p>
                        </div>
                    )}

                    <div
                        ref={observerRef}
                        style={{ height: "1px" }}
                        aria-hidden="true"
                    />

                    {!hasMore && !loading && users.length > 0 && (
                        <div className="flex flex-col items-center justify-center p-6 gap-1 border-t">
                            <p className="text-sm text-muted-foreground">
                                You've reached the end of the list
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Showing all {users.length}{" "}
                                {users.length === 1 ? "user" : "users"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SearchUser;
