import {
    createContext,
    useState,
    useContext,
    useEffect,
    type ReactNode,
} from "react";
import toast from "react-hot-toast";
import api, { setApiAccessToken } from "../services/api";

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    bio?: string;
    profilePicture?: {
        secure_url: string;
    };
}

export interface AuthContextType {
    user: User | null;
    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserDetails = async () => {
        try {
            const response = await api.get("/users/me");
            setUser(response.data.data);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            setUser(null);
            setApiAccessToken(null);
        }
    };

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await api.post("/auth/refresh");
                const newAccessToken = response.data.data.accessToken;

                setApiAccessToken(newAccessToken);

                await fetchUserDetails();
            } catch (error) {
                setUser(null);
                setApiAccessToken(null);
            } finally {
                console.log("Auth check finished. Setting isLoading to false.");
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (data: { email: string; password: string }) => {
        try {
            const response = await api.post("/auth/login", data);
            const newAccessToken = response.data.data.accessToken;

            setApiAccessToken(newAccessToken);

            await fetchUserDetails();

            toast.success("Login successful!");
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error(
                "Logout API call failed, but clearing session anyway."
            );
        } finally {
            setUser(null);
            setApiAccessToken(null);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
