import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Global Mobility Intelligence Platform",
    description: "AI-powered immigration pathway analysis with multi-agent reasoning",
    keywords: ["immigration", "visa", "mobility", "AI", "pathway analysis"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="dark">
            <body className={`${inter.className} bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 min-h-screen`}>
                <div className="min-h-screen flex flex-col">
                    <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                            <a href="/" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
                                    <span className="text-white font-bold text-sm">GM</span>
                                </div>
                                <span className="font-semibold text-lg text-white">
                                    Mobility Intelligence
                                </span>
                            </a>
                            <nav className="flex items-center gap-6 text-sm">
                                <a href="/analyze" className="text-white/60 hover:text-white transition-colors relative group">
                                    Analyze
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                                </a>
                                <a href="/explore" className="text-white/60 hover:text-white transition-colors relative group">
                                    Explore Countries
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                                </a>
                                <a href="/travel-plan" className="text-white/60 hover:text-white transition-colors relative group">
                                    Travel Plan
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                                </a>
                                <a href="/book-travel" className="text-white/60 hover:text-white transition-colors relative group">
                                    Book Flights & Hotels
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                                </a>
                            </nav>
                        </div>
                    </header>
                    <main className="flex-1">
                        {children}
                    </main>
                    <footer className="border-t border-white/10 py-8 bg-slate-900/30 backdrop-blur-sm">
                        <div className="container mx-auto px-4">
                            <p className="text-center text-sm text-white/40">Global Mobility Intelligence Platform • Hackathon 2025</p>
                            {/* <p className="text-xs mt-1 text-center text-white/30">AI-powered analysis for educational purposes only</p> */}
                            
                            {/* Contact Section */}
                            <div className="mt-5 pt-4 border-white/10">
                                <p className="text-xs text-white/50 text-center mb-3">Contact Us</p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-white/60 font-medium">Vishnu Koushik</span>
                                        <span className="text-white/40">📞 9550899505</span>
                                        <a href="mailto:vishnukoushikn@gmail.com" className="text-blue-400/70 hover:text-blue-400 transition-colors">vishnukoushikn@gmail.com</a>
                                    </div>
                                    <div className="hidden sm:block w-px h-12 bg-white/10"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-white/60 font-medium">Sai Sreedhar</span>
                                        <span className="text-white/40">📞 9182937061</span>
                                        <a href="mailto:cnssreedhar2001@gmail.com" className="text-blue-400/70 hover:text-blue-400 transition-colors">cnssreedhar2001@gmail.com</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
