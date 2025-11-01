import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PlusCircle, X, Image as ImageIcon, Type, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import  api  from "@/services/api";

type Block = { type: "text"; value: string } | { type: "image"; value: File };

export function CreatePost() {
  const [blocks, setBlocks] = useState<Block[]>([{ type: "text", value: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangeText = (index: number, value: string) => {
    setBlocks((prev) =>
      prev.map((block, i) =>
        i === index && block.type === "text" ? { ...block, value } : block
      )
    );
  };

  const handleAddImage = (file: File) => {
    if (file instanceof File) {
      setBlocks([...blocks, { type: "image", value: file }]);
    }
  };

  const handleAddText = () => {
    setBlocks([...blocks, { type: "text", value: "" }]);
  };

  const handleRemove = (index: number) => {
    if (blocks.length > 1) {
      setBlocks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();

      blocks.forEach((block, index) => {
        formData.append(`content[${index}][type]`, block.type);
        if (block.type === "image" && block.value instanceof File) {
          formData.append(`content[${index}][value]`, block.value);
        } else {
          formData.append(`content[${index}][value]`, block.value);
        }
      });

      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      console.log(formData);
      console.log(response);
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Create Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="relative group"
              >
                {block.type === "text" ? (
                  <div className="relative">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={block.value}
                      onChange={(e) => handleChangeText(index, e.target.value)}
                      className="min-h-[120px] text-base resize-none"
                    />
                    {blocks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => handleRemove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={URL.createObjectURL(block.value)}
                      alt="preview"
                      className="max-h-80 w-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <div className="flex gap-2 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 px-3 h-9 rounded-lg hover:bg-accent/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>Image</span>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleAddImage(file);
                }
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 px-3 h-9 rounded-lg hover:bg-accent/50 transition-colors"
            onClick={handleAddText}
            type="button"
          >
            <Type className="w-4 h-4 text-primary" />
            <span>Text</span>
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={
            submitting ||
            blocks.every((b) => b.type === "text" && !b.value.trim())
          }
          className="w-full h-10 rounded-lg transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing...
            </>
          ) : (
            <span className="flex items-center gap-1">
              <PlusCircle className="w-4 h-4" />
              Publish Post
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
