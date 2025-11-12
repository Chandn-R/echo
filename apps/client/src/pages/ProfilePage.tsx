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
    Settings, // <-- New Icon
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
    DialogDescription, // <-- New Import
    DialogClose, // <-- New Import
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/useAuthStore";
// --- NEW IMPORTS ---
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Controller } from "react-hook-form";
// --- END NEW IMPORTS ---

// This is the same FullUserProfile interface from the wrapper
// (In a real app, this would be in a shared types file)
interface FullUserProfile {
    id: string;
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
    birthDate?: string;
    private?: boolean;
    country?: string;
    language?: string;
}

interface UserProfileProps {
    initialUser: FullUserProfile; // Renamed from 'user' to avoid conflicts
}

export function ProfilePage({ initialUser }: UserProfileProps) {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    
    // This state holds the profile data and can be updated by the forms
    const [userData, setUserData] = useState(initialUser);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Update profile pic preview separately
    const [profilePic, setProfilePic] = useState(
        userData.profilePicture?.secure_url
    );

    // This function will be passed to child forms to update the parent state
    const handleProfileUpdate = (updatedData: FullUserProfile) => {
        setUserData(updatedData);
        if (updatedData.profilePicture?.secure_url) {
            setProfilePic(updatedData.profilePicture.secure_url);
        }
        setIsSettingsOpen(false); // Close modal on success
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
                {/* --- LEFT STICKY CARD --- */}
                <div className=" max-h-[500px] lg:sticky lg:top-10">
                    <div className="lg:col-span-1 space-y-6 ">
                        <Card className="rounded-lg shadow-sm space-y-5">
                            <CardHeader className="flex-col items-center">
                                <div className="flex justify-center mb-4">
                                    <Avatar className="h-32 w-32 mb-4 mt-4">
                                        <AvatarImage
                                            src={profilePic}
                                            className="h-full w-full object-cover rounded-full"
                                            alt={userData.username}
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
                                    {userData.bio && (
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
                                            {userData.posts.length}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Posts
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            {userData.followers.length}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Followers
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold">
                                            {userData.following.length}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Following
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                {/* --- NEW SETTINGS DIALOG --- */}
                                <Dialog
                                    open={isSettingsOpen}
                                    onOpenChange={setIsSettingsOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Settings</DialogTitle>
                                            <DialogDescription>
                                                Manage your profile, account, and
                                                privacy settings.
                                            </DialogDescription>
                                        </DialogHeader>
                                        
                                        <Tabs defaultValue="profile" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="profile">
                                                    Profile
                                                </TabsTrigger>
                                                <TabsTrigger value="account">
                                                    Account
                                                </TabsTrigger>
                                                <TabsTrigger value="privacy">
                                                    Privacy
                                                </TabsTrigger>
                                            </TabsList>

                                            {/* --- TAB 1: PUBLIC PROFILE --- */}
                                            <TabsContent value="profile">
                                                <PublicProfileForm
                                                    user={userData}
                                                    onUpdate={handleProfileUpdate}
                                                    setPreviewPic={setProfilePic}
                                                    previewPic={profilePic}
                                                />
                                            </TabsContent>

                                            {/* --- TAB 2: ACCOUNT SETTINGS --- */}
                                            <TabsContent value="account">
                                                <AccountSettingsForm
                                                    user={userData}
                                                    onUpdate={handleProfileUpdate}
                                                />
                                            </TabsContent>
                                            
                                            {/* --- TAB 3: PRIVACY SETTINGS --- */}
                                            <TabsContent value="privacy">
                                                <PrivacySettingsForm
                                                    user={userData}
                                                    onUpdate={handleProfileUpdate}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>
                                {/* --- END SETTINGS DIALOG --- */}

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

                {/* --- RIGHT POSTS FEED (No changes) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="lg:sticky lg:top-10 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">My Posts</h2>
                        </div>
                        <Separator />
                    </div>

                    <div className=" lg:max-h-[640px] overflow-y-auto">
                        {userData.posts.length === 0 ? (
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
                                {userData.posts.map((post) => (
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
                                                                    userData
                                                                        .profilePicture
                                                                        ?.secure_url
                                                                }
                                                                alt={
                                                                    userData.username
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {userData.username
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-sm">
                                                                {userData.name}
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

// --- NEW COMPONENT 1: PublicProfileForm ---
// (This is the old "Edit Profile" form, now focused)

interface PublicProfileFormProps {
    user: FullUserProfile;
    onUpdate: (data: FullUserProfile) => void;
    previewPic: string | undefined;
    setPreviewPic: (url: string) => void;
}

function PublicProfileForm({ 
    user, 
    onUpdate,
    previewPic,
    setPreviewPic
}: PublicProfileFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            username: user.username,
            name: user.name,
            bio: user.bio || "",
        },
    });

    const handleChangePhotoClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewPic(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: { username: string; name: string; bio?: string }) => {
        try {
            setIsUpdating(true);
            const formData = new FormData();
            formData.append("username", data.username);
            formData.append("name", data.name);
            if (data.bio) formData.append("bio", data.bio);

            if (fileInputRef.current?.files?.[0]) {
                formData.append(
                    "profilePicture",
                    fileInputRef.current.files[0]
                );
            }

            // This API endpoint might need to be adjusted
            // e.g., to PATCH /users/profile and PATCH /users/settings separately
            // For now, assume one endpoint handles all.
            const response = await api.patch("/users/profile", formData);
            if (!response.data.success) throw new Error(response.data.message);
            
            toast.success("Profile updated successfully!");
            onUpdate(response.data.data); // Update parent state

        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1 pt-4">
            <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage
                        src={previewPic}
                        className="h-full w-full object-cover rounded-full"
                        alt={user.username}
                    />
                    <AvatarFallback className="bg-muted text-2xl">
                        {user.username.charAt(0).toUpperCase()}
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
            
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register("username", { required: "Username is required" })} />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: "Name is required" })} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register("bio")} placeholder="Tell us about yourself..." rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting || isUpdating}>
                    {isSubmitting || isUpdating ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}


// --- NEW COMPONENT 2: AccountSettingsForm ---

function AccountSettingsForm({ user, onUpdate }: { user: FullUserProfile; onUpdate: (data: FullUserProfile) => void; }) {
    
    // Form for Email
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { email: user.email },
    });

    // Form for Password (separate)
    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword }, reset: resetPasswordForm } = useForm();
    
    const onEmailSubmit = async (data: { email: string }) => {
        try {
            // Assumes a different endpoint for account details
            const response = await api.patch("/users/account", data);
            if (!response.data.success) throw new Error(response.data.message);
            
            toast.success("Email updated successfully!");
            onUpdate(response.data.data);
            
        } catch (err) {
            console.error("Error updating email:", err);
            toast.error("Failed to update email. It may already be in use.");
        }
    };
    
    const onPasswordSubmit = async (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        try {
            // Assumes a specific endpoint for password change
            const response = await api.patch("/users/password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            if (!response.data.success) throw new Error(response.data.message);

            toast.success("Password changed successfully!");
            resetPasswordForm();

        } catch (err) {
             console.error("Error changing password:", err);
             toast.error("Failed to change password. Please check your current password.");
        }
    };

    return (
        <div className="space-y-8 p-1 pt-4">
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email", { required: "Email is required" })} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Email"}
                    </Button>
                </div>
            </form>

            <Separator />
            
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                <h4 className="font-medium">Change Password</h4>
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" {...registerPassword("currentPassword", { required: "Current password is required" })} />
                    {passwordErrors.currentPassword && <p className="text-sm text-red-500">{(passwordErrors.currentPassword as any).message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" {...registerPassword("newPassword", { required: "New password is required", minLength: { value: 6, message: "Must be at least 6 characters"} })} />
                    {passwordErrors.newPassword && <p className="text-sm text-red-500">{(passwordErrors.newPassword as any).message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword", { required: "Please confirm your password" })} />
                    {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{(passwordErrors.confirmPassword as any).message}</p>}
                </div>
                <div className="flex justify-end">
                    <Button type="submit" variant="destructive" disabled={isSubmittingPassword}>
                        {isSubmittingPassword ? "Saving..." : "Change Password"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// --- NEW COMPONENT 3: PrivacySettingsForm ---

function PrivacySettingsForm({ user, onUpdate }: { user: FullUserProfile; onUpdate: (data: FullUserProfile) => void; }) {
    
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            private: user.private || false,
            birthDate: user.birthDate ? user.birthDate.split('T')[0] : "", // Format for <input type="date">
            country: user.country || "India",
            language: user.language || "english",
        },
    });

    const onSubmit = async (data: any) => {
         try {
            // Assumes an endpoint for profile settings
            const response = await api.patch("/users/settings", data);
            if (!response.data.success) throw new Error(response.data.message);
            
            toast.success("Settings updated successfully!");
            onUpdate(response.data.data);
            
        } catch (err) {
            console.error("Error updating settings:", err);
            toast.error("Failed to update settings.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1 pt-4">
            
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="private" className="text-base">Private Account</Label>
                    <p className="text-sm text-muted-foreground">
                        If enabled, only your followers can see your posts.
                    </p>
                </div>
                 <Controller
                    name="private"
                    control={control}
                    render={({ field }) => (
                         <Switch
                            id="private"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                         />
                    )}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                <p className="text-xs text-muted-foreground">
                    This will not be shown on your public profile.
                </p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="USA">USA</SelectItem>
                                <SelectItem value="UK">UK</SelectItem>
                                {/* Add more countries as needed */}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                {/* Add more languages as needed */}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                 <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </form>
    );
}