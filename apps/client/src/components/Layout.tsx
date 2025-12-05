import { Home, User, Search, PlusCircle, MessageSquare } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Outlet, useNavigate } from "react-router-dom";
import Logo from "@/assets/logo.svg";

function Layout() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen w-full">
            {/* 1. LEFT SIDEBAR (No changes) */}
            <aside className="w-24 bg-background flex flex-col items-center py-6 border-r border-border sticky top-0 h-screen">
                <button
                    onClick={() => navigate("/")}
                    className="mb-10 hover:opacity-90"
                >
                    <img src={Logo} alt="Logo" className="w-12 h-12" />
                </button>

                <nav className="flex flex-col items-center space-y-6 flex-1">
                    <NavButton
                        icon={<Home className="h-6 w-6" />}
                        onClick={() => navigate("/")}
                    />
                    <NavButton
                        icon={<Search className="h-6 w-6" />}
                        onClick={() => navigate("/search")}
                    />
                    <NavButton
                        icon={<PlusCircle className="h-6 w-6" />}
                        onClick={() => navigate("/create")}
                    />
                    <NavButton
                        icon={<MessageSquare className="h-6 w-6" />}
                        onClick={() => navigate("/chat")}
                    />
                </nav>

                <div className="flex flex-col items-center gap-6 pb-4">
                    <ModeToggle />
                    <NavButton
                        icon={<User className="h-6 w-6" />}
                        onClick={() => navigate("/user/me")}
                    />
                </div>
            </aside>

            {/* 2. MAIN CONTENT (No changes) */}
            <main className="flex-1 flex justify-center p-6 overflow-y-auto">
                <div className="w-full max-w-3xl">
                    <Outlet />
                </div>
            </main>

            <aside className="w-72 bg-background flex flex-col p-6 border-l border-border sticky top-0 h-screen lg:flex">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-foreground">
                        Suggestions for you
                    </h3>
                    <SuggestionCard
                        name="Alice"
                        handle="@alice"
                        avatarUrl="https://i.pravatar.cc/150?img=1"
                    />
                    <SuggestionCard
                        name="Bob"
                        handle="@bob"
                        avatarUrl="https://i.pravatar.cc/150?img=2"
                    />
                    <SuggestionCard
                        name="Charlie"
                        handle="@charlie"
                        avatarUrl="https://i.pravatar.cc/150?img=3"
                    />
                    <SuggestionCard
                        name="David"
                        handle="@david"
                        avatarUrl="https://i.pravatar.cc/150?img=4"
                    />
                    <SuggestionCard
                        name="Eve"
                        handle="@eve"
                        avatarUrl="https://i.pravatar.cc/150?img=5"
                    />
                    <SuggestionCard
                        name="Eve"
                        handle="@eve"
                        avatarUrl="https://i.pravatar.cc/150?img=5"
                    />
                </div>

                <hr className="my-6" />

                {/* Section 2: Trends */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                        Trends for you
                    </h3>
                    <TrendItem
                        category="Technology"
                        topic="#React19"
                        postCount="15.2K"
                    />
                    <TrendItem
                        category="Gaming"
                        topic="#IndieDev"
                        postCount="8.1K"
                    />
                    <TrendItem
                        category="Science"
                        topic="#AI"
                        postCount="120K"
                    />
                </div>

                {/* Section 3: Footer (pushed to bottom) */}
                <SidebarFooter />
            </aside>
        </div>
    );
}

// --- NavButton Component (No changes) ---
function NavButton({
    icon,
    onClick,
}: {
    icon: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="rounded-lg h-12 w-12 flex items-center justify-center hover:bg-accent transition-colors"
        >
            {icon}
        </button>
    );
}

// --- SuggestionCard Component (No changes) ---
function SuggestionCard({
    name,
    handle,
    avatarUrl,
}: {
    name: string;
    handle: string;
    avatarUrl?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User className="w-5 h-5 text-muted-foreground" />
                )}
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{handle}</p>
            </div>
            <button className="text-primary text-sm font-medium hover:opacity-80 px-3 py-1">
                Follow
            </button>
        </div>
    );
}

// --- NEW: TrendItem Component ---
function TrendItem({
    category,
    topic,
    postCount,
}: {
    category: string;
    topic: string;
    postCount: string;
}) {
    return (
        // Made this a button so it can be clicked to see the trend
        <button className="text-left w-full hover:bg-accent p-2 rounded-lg transition-colors">
            <p className="text-xs text-muted-foreground">
                {category} · Trending
            </p>
            <p className="font-medium text-sm text-foreground">{topic}</p>
            <p className="text-xs text-muted-foreground">{postCount} posts</p>
        </button>
    );
}

// --- NEW: SidebarFooter Component ---
function SidebarFooter() {
    return (
        // mt-auto is the magic here. It pushes this footer
        // to the bottom of the flex-col container.
        <footer className="mt-auto">
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {/* You can replace these with React Router <Link> components */}
                <a href="#" className="hover:underline">
                    About
                </a>
                <a href="#" className="hover:underline">
                    Help
                </a>
                <a href="#" className="hover:underline">
                    Privacy
                </a>
                <a href="#" className="hover:underline">
                    Terms
                </a>
                <a href="#" className="hover:underline">
                    API
                </a>
                <a href="#" className="hover:underline">
                    Locations
                </a>
            </nav>
            <p className="text-xs text-muted-foreground mt-4">
                © 2025 Your App Name
            </p>
        </footer>
    );
}

export default Layout;
