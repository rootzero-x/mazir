import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
    content: string;
    className?: string;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
    return (
        <div className={cn("prose prose-invert prose-blue max-w-none", className)}>
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";
                        const codeString = String(children).replace(/\n$/, "");

                        if (!inline && (language || codeString.includes("\n") || isLikelyCode(codeString))) {
                            return (
                                <CodeBlock
                                    code={codeString}
                                    language={language || guessLanguage(codeString)}
                                />
                            );
                        }

                        return (
                            <code className={cn("bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-sm", className)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Style other elements if needed
                    p: ({ children }) => <p className="leading-relaxed mb-4 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// Simple heuristic to detect code even if not in backticks
function isLikelyCode(text: string): boolean {
    const codeIndicators = [
        "CREATE TABLE", "SELECT ", "FROM ", "WHERE ", "UPDATE ", "INSERT INTO",
        "def ", "function ", "const ", "let ", "var ", "import ", "class ",
        "console.log", "printf", "cout <<", "<?php", "<html>", "</div>"
    ];
    return codeIndicators.some(indicator => text.toUpperCase().includes(indicator.toUpperCase()));
}

function guessLanguage(text: string): string {
    if (text.toUpperCase().includes("SELECT ") || text.toUpperCase().includes("CREATE ")) return "sql";
    if (text.includes("import ") || text.includes("const ") || text.includes("function ")) return "javascript";
    if (text.includes("def ")) return "python";
    if (text.includes("<html>")) return "html";
    return "txt";
}
