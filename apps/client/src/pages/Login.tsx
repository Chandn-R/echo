import { useState, useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { Separator } from "@/components/ui/separator";
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

import { loginSchema, type LoginSchema } from "../schemas/loginSchema";
import { useAuthStore } from "@/stores/useAuthStore";

export function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const user = useAuthStore((s) => s.user);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    const onSubmit = async (data: LoginSchema) => {
        setIsSubmitting(true);
        try {
            await login({
                email: data.email,
                password: data.password,
            });
            console.log("Done");
            navigate("/", { replace: true });
        } catch (error) {
            toast.error("Invalid email or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center min-h-screen items-center text-xl">
            <Card className="w-full max-w-sm gap-6">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username or email to login into your account
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="link"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </Button>
                    </CardAction>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Username / Email</Label>
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
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4 px-0 pb-6 pt-8 mr-6 ml-6">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting ? <Spinner /> : "Login"}
                        </Button>
                        {/* <Separator className="my-4" /> */}
                    </CardFooter>
                </form>
                {/* <Button onClick={() => navigate("/auth/google")}>
                    Google Login
                </Button> */}
            </Card>
        </div>
    );
}
