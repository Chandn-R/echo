import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import {
    LogOut,
    Edit,
    Trash2,
    Heart,
    MessageSquare,
    MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

interface UserProfileProps {
    user: {
        _id: string;
        name: string;
        username: string;
        email: string;
        followers: Array<{
            _id: string;
            name: string;
            username: string;
            profilePicture?: {
                secure_url: string;
            };
        }>;
        following: string[];
        bio: string;
        profilePicture?: {
            secure_url: string;
        };
        posts: Array<{
            _id: string;
            user: string;
            content: Array<{
                type: "text" | "image";
                value: string;
                public_id?: string;
            }>;
            likes: Array<string>;
            comments: Array<string>;
            createdAt: string;
            updatedAt: string;
        }>;
        createdAt: string;
        updatedAt: string;
        isFollowing: boolean;
    };
}

interface FormData {
    name: string;
    username: string;
    email: string;
    bio?: string;
    profilePicture?: File;
}

export function ProfilePage({ user }: UserProfileProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const [profilePic, setProfilePic] = useState(
        user.profilePicture?.secure_url
    );
    const [userData, setUserData] = useState(user);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        defaultValues: {
            username: user.username,
            name: user.name,
            email: user.email,
            bio: user.bio || "",
        },
    });

    const handleChangePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setProfilePic(previewURL);
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            setIsUpdating(true);

            const formData = new FormData();
            formData.append("username", data.username);
            formData.append("name", data.name);
            formData.append("email", data.email);
            if (data.bio) formData.append("bio", data.bio);

            if (fileInputRef.current?.files?.[0]) {
                formData.append(
                    "profilePicture",
                    fileInputRef.current.files[0]
                );
            }

            const response = await api.patch("/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (!response.data.success) {
                throw new Error(
                    response.data.message || "Failed to update profile"
                );
            }

            toast.success("Profile updated successfully!");
            setIsEditModalOpen(false);
            setUserData(response.data.data);

            if (response.data.data.profilePicture?.secure_url) {
                setProfilePic(response.data.data.profilePicture.secure_url);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        try {
            const response = await api.delete(`/posts/${postId}`, {
                withCredentials: true,
            });

            if (response.data.success) {
                setUserData({
                    ...userData,
                    posts: userData.posts.filter((post) => post._id !== postId),
                });
                toast.success("Post deleted successfully");
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            toast.error("Failed to delete post");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className=" max-h-[500px] lg:sticky lg:top-10">
                    <div className="lg:col-span-1 space-y-6 ">
                        <Card className="rounded-lg shadow-sm space-y-5">
                            <CardHeader className="flex-col items-center">
                                <div className="flex justify-center mb-4">
                                    <Avatar className="h-32 w-32 mb-4 mt-4">
                                        <AvatarImage
                                            src={profilePic}
                                            className="h-full w-full object-cover rounded-full"
                                            alt={user.username}
                                        />
                                        <AvatarFallback className="bg-muted text-4xl">
                                            {userData.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="text-center">
                                    <CardTitle className="text-2xl">
                                        {userData.name}
                                    </CardTitle>
                                    <CardDescription className="text-lg">
                                        @{userData.username}
                                    </CardDescription>
                                    {user.bio && (
                                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                                            {userData.bio}
                                        </p>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label className="font-medium">Email</Label>
                                    <p>{userData.email}</p>
                                </div>

                                <div className="flex justify-between pt-2">
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            {user.posts.length}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Posts
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            {user.followers.length}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Followers
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            {user.following.length}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Following
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Dialog
                                    open={isEditModalOpen}
                                    onOpenChange={setIsEditModalOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Edit Profile
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col items-center gap-6 py-4">
                                            <Avatar className="h-30 w-30">
                                                <AvatarImage
                                                    src={profilePic}
                                                    className="h-full w-full object-cover rounded-full"
                                                    alt={user.username}
                                                />
                                                <AvatarFallback className="bg-muted text-2xl">
                                                    {user.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={handleChangePhotoClick}
                                            >
                                                Change Photo
                                            </Button>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                        <form
                                            onSubmit={handleSubmit(onSubmit)}
                                            className="space-y-6 p-3"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="username">
                                                    Username
                                                </Label>
                                                <Input
                                                    id="username"
                                                    {...register("username", {
                                                        required:
                                                            "Username is required",
                                                        minLength: {
                                                            value: 3,
                                                            message:
                                                                "Username must be at least 3 characters",
                                                        },
                                                    })}
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            errors.username
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    {...register("name", {
                                                        required:
                                                            "Name is required",
                                                        minLength: {
                                                            value: 3,
                                                            message:
                                                                "Name must be at least 3 characters",
                                                        },
                                                    })}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.name.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...register("email", {
                                                        required:
                                                            "Email is required",
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message:
                                                                "Invalid email address",
                                                        },
                                                    })}
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.email.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Bio</Label>
                                                <Textarea
                                                    id="bio"
                                                    {...register("bio")}
                                                    placeholder="Tell us about yourself..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={() =>
                                                        setIsEditModalOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        isSubmitting ||
                                                        isUpdating
                                                    }
                                                >
                                                    {isSubmitting || isUpdating
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    variant="destructive"
                                    onClick={handleLogout}
                                    className="w-full"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log Out
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="lg:sticky lg:top-10 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">My Posts</h2>
                        </div>
                        <Separator />
                    </div>

                    <div className=" lg:max-h-[640px] overflow-y-auto">
                        {user.posts.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-gray-500">
                                        "You haven't created any posts yet."
                                    </p>

                                    <Button
                                        variant="link"
                                        className="mt-2"
                                        onClick={() => navigate("/create")}
                                    >
                                        Create your first post
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {user.posts.map((post) => (
                                    <Card
                                        key={post._id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={
                                                                    user
                                                                        .profilePicture
                                                                        ?.secure_url
                                                                }
                                                                alt={
                                                                    user.username
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {user.username
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-sm">
                                                                {user.name}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                {formatDate(
                                                                    post.createdAt
                                                                )}
                                                                {post.createdAt !==
                                                                    post.updatedAt &&
                                                                    " (edited)"}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeletePost(
                                                                    post._id
                                                                )
                                                            }
                                                            className="text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {post.content.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="mb-4"
                                                >
                                                    {item.type === "text" ? (
                                                        <p className="whitespace-pre-line">
                                                            {item.value}
                                                        </p>
                                                    ) : (
                                                        <img
                                                            src={item.value}
                                                            alt="Post content"
                                                            className="rounded-lg w-full max-h-96 object-contain"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                        <CardFooter className="flex justify-between">
                                            <Button variant="ghost">
                                                <Heart className="w-4 h-4 mr-2" />
                                                {post.likes.length} Likes
                                            </Button>
                                            <Button variant="ghost">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                {post.comments.length} Comments
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
