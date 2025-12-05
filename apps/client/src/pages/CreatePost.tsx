import { useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import api from "@/services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const formSchema = z.object({
    description: z.string().max(500),
    image: z
        .instanceof(File, { message: "Image is required" })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Invalid file type",
        })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: "File must be 5MB or less",
        })
        .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePost() {
    const { user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { description: "", image: undefined },
    });

    const imageFile = watch("image");
    const previewUrl = imageFile ? URL.createObjectURL(imageFile) : null;
    const { ref: descriptionRef, ...descriptionRest } = register("description");

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target;
        target.style.height = "auto";
        target.style.height = `${target.scrollHeight}px`;
    };

    const handleFile = useCallback(
        (file: File) => {
            if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
                return toast.error("File type not supported");
            if (file.size > MAX_FILE_SIZE)
                return toast.error("File too large (Max 5MB)");

            setValue("image", file);
        },
        [setValue]
    );

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) handleFile(e.target.files[0]);
    };

    const removeImage = () => {
        setValue("image", null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = async (data: FormValues) => {
        try {
            if (!data.image) return;

            const formData = new FormData();
            formData.append("description", data.description);
            if (data.image) formData.append("image", data.image);

            console.log(formData);

            await api.post("users/post", formData);

            setValue("description", "");
            setValue("image", null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (textareaRef.current) textareaRef.current.style.height = "auto";
            toast.success("Post published!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create post");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] w-full">
            <div className="w-full max-w-2xl border-b border-border bg-background px-4 py-6 sm:rounded-xl sm:border sm:shadow-sm">
                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
                    <div className="shrink-0">
                        <Avatar className="h-11 w-11 cursor-pointer hover:opacity-90">
                            <AvatarImage
                                src={user?.profilePicture?.secure_url}
                                className="object-cover"
                            />
                            <AvatarFallback>
                                {user?.userName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                        <Textarea
                            className="min-h-11 w-full resize-none border-none bg-transparent py-3 px-4 text-lg leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0 shadow-none"
                            {...descriptionRest}
                            ref={(e) => {
                                descriptionRef(e);
                                textareaRef.current = e;
                            }}
                            onChange={(e) => {
                                descriptionRest.onChange(e);
                                handleInput(e);
                            }}
                            placeholder="Share your memories..."
                            rows={1}
                        />

                        {previewUrl && (
                            <div className="relative mt-4 rounded-xl overflow-hidden border border-border/50">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full max-h-[500px] object-contain bg-muted/20"
                                />
                            </div>
                        )}

                        <div className="mt-4 h-px bg-border/40" />

                        <div className="flex items-center justify-between pt-3">
                            <div className="flex items-center -ml-2.5">
                                <input
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={onFileChange}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary/90 hover:text-primary hover:bg-primary/10 rounded-full gap-2 px-3 h-9"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <ImageIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Media
                                    </span>
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || !imageFile}
                                className="rounded-full px-6 font-semibold"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Post"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}