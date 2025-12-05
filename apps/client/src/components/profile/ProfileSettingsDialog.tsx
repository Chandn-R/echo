import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import type { FullUserProfile } from "@/types";
import api from "@/services/api";
import toast from "react-hot-toast";

interface Props {
    user: FullUserProfile;
    onUpdate: (data: Partial<FullUserProfile>) => void;
}

export function ProfileSettingsDialog({ user, onUpdate }: Props) {
    const [open, setOpen] = useState(false);
    // Lift preview state here so it persists across tab switches if needed
    const [previewPic, setPreviewPic] = useState(user.profilePicture?.secure_url);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>Manage your public profile and account.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="profile" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="privacy">Privacy</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4">
                        <PublicProfileForm 
                            user={user} 
                            onUpdate={onUpdate} 
                            previewPic={previewPic} 
                            setPreviewPic={setPreviewPic} 
                        />
                    </TabsContent>
                    
                    <TabsContent value="account" className="mt-4">
                        <AccountSettingsForm user={user} onUpdate={onUpdate} />
                    </TabsContent>
                    
                    <TabsContent value="privacy" className="mt-4">
                        <PrivacySettingsForm user={user} onUpdate={onUpdate} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// --- SUB-FORM 1: Public Profile ---
function PublicProfileForm({ user, onUpdate, previewPic, setPreviewPic }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            userName: user.userName,
            name: user.name,
            bio: user.bio || "",
        }
    });

    const onSubmit = async (data: any) => {
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append("userName", data.userName);
            formData.append("name", data.name);
            formData.append("bio", data.bio);
            
            // "profilePicture" matches backend multer config
            if (fileInputRef.current?.files?.[0]) {
                formData.append("profilePicture", fileInputRef.current.files[0]);
            }

            // PATCH request to /profile/update
            const res = await api.patch("/users/profile/update", formData);
            
            if(res.data.success) {
                toast.success("Profile updated");
                onUpdate(res.data.data); // Update parent state
            }
        } catch (error) {
            console.error(error);
            toast.error("Update failed");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
             <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 ring-1 ring-border">
                    <AvatarImage src={previewPic} className="object-cover" />
                    <AvatarFallback className="text-xl">{user.userName[0]}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    Change Avatar
                </Button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                        if(e.target.files?.[0]) setPreviewPic(URL.createObjectURL(e.target.files[0]));
                    }} 
                />
            </div>

            <div className="space-y-2">
                <Label>Display Name</Label>
                <Input {...register("name", { required: true })} />
            </div>
            <div className="space-y-2">
                <Label>Username</Label>
                <Input {...register("userName", { required: true })} />
            </div>
            <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea {...register("bio")} placeholder="Tell us about yourself..." className="resize-none" rows={3} />
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
            </div>
        </form>
    );
}

// --- SUB-FORM 2: Account ---
function AccountSettingsForm({ user, onUpdate }: any) {
    const { register, handleSubmit } = useForm({ defaultValues: { email: user.email } });
    
    const onSubmit = async (data: any) => {
        try {
            // Using the same update route since it handles email too
            const res = await api.patch("/users/profile/update", data); 
            toast.success("Email updated");
            onUpdate({ email: data.email });
        } catch(e) { toast.error("Failed to update email"); }
    };

    return (
        <div className="space-y-6 pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Label>Email Address</Label>
                <div className="flex gap-2">
                    <Input {...register("email", { required: true })} />
                    <Button type="submit">Update</Button>
                </div>
            </form>
            <Separator />
            <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Password Management</h4>
                <p className="text-xs text-muted-foreground">Password updates are handled via a separate secure flow.</p>
                <Button variant="secondary" className="w-full sm:w-auto">Request Password Reset</Button>
            </div>
        </div>
    );
}

// --- SUB-FORM 3: Privacy ---
function PrivacySettingsForm({ user, onUpdate }: any) {
    const { register, control, handleSubmit } = useForm({
        defaultValues: {
            private: user.private || false,
            // Safe date formatting
            birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
            country: user.country || "India",
            language: user.language || "english"
        }
    });

    const onSubmit = async (data: any) => {
        try {
            const res = await api.patch("/users/profile/update", data);
            toast.success("Privacy settings saved");
            onUpdate(data);
        } catch(e) { toast.error("Update failed"); }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="flex items-center justify-between border p-3 rounded-md">
                <div className="space-y-0.5">
                    <Label className="text-base">Private Account</Label>
                    <p className="text-xs text-muted-foreground">Only followers can see your posts</p>
                </div>
                <Controller 
                    control={control} 
                    name="private" 
                    render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )} 
                />
            </div>

            <div className="space-y-2">
                <Label>Birth Date</Label>
                <Input type="date" {...register("birthDate")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Country</Label>
                    <Controller 
                        control={control} 
                        name="country" 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="India">India</SelectItem>
                                    <SelectItem value="USA">USA</SelectItem>
                                    <SelectItem value="UK">UK</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                </div>
                <div className="space-y-2">
                    <Label>Language</Label>
                    <Controller 
                        control={control} 
                        name="language" 
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="spanish">Spanish</SelectItem>
                                    <SelectItem value="hindi">Hindi</SelectItem>
                                </SelectContent>
                            </Select>
                        )} 
                    />
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit">Save Preferences</Button>
            </div>
        </form>
    );
}