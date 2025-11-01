import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authServices";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpSchema } from "../schemas/signUpSchema";
import { Spinner } from "@/components/ui/loader";
import { toast } from "react-hot-toast";
import { useState } from "react";

export function SignUp() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpSchema) => {
        setIsSubmitting(true);

        try {
            const response = await authService.registerUser(data);

            if (response.success) {
                toast.success("Registration successful! Please login.");
                navigate("/login");
            } else {
                toast.error(
                    response.error || "Registration failed, please try again."
                );
            }
        } catch (error) {
            console.error("Registration failed", error);
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen items-center text-xl">
            <Card className="w-full max-w-sm gap-6">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                        Enter your details to create an account
                    </CardDescription>
                    <CardAction>
                        <Button
                            onClick={() => navigate("/login")}
                            variant="link"
                        >
                            Login
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Alex Johnson"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="alex@example.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    placeholder="alex123"
                                    {...register("username")}
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-500">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <CardFooter className="flex-col gap-2 px-0 pb-0 pt-6">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Spinner />}
                                {!isSubmitting && "Register"}
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
