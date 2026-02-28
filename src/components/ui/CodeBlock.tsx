import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
    code: string;
    language?: string;
}

export default function CodeBlock({ code, language = "javacript" }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative my-6 rounded-2xl overflow-hidden border border-white/5 bg-slate-950/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900/60 border-b border-white/5 backdrop-blur-md">
                <span className="text-[11px] font-bold text-violet-400/80 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                    {language || "code"}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-sm border border-transparent hover:border-white/5"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <div className="relative">
                <SyntaxHighlighter
                    language={language.toLowerCase()}
                    style={atomDark}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        borderRadius: 0,
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                        }
                    }}
                >
                    {code.trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
