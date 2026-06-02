"use client";

import React, { useEffect, useRef } from "react";
import { IBlockEditorProps } from "@/types/editor";

export default function BlockEditor({ data, onChange }: IBlockEditorProps) {
    const editorRef = useRef<any>(null);
    const isReady = useRef(false);

    useEffect(() => {
        if (!isReady.current) {
            isReady.current = true;
            initEditor();
        }

        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
                isReady.current = false;
            }
        };
    }, []);

    const initEditor = async () => {
        const EditorJS = (await import("@editorjs/editorjs")).default;
        const Header = (await import("@editorjs/header")).default;
        const List = (await import("@editorjs/list")).default;
        const ImageTool = (await import("@editorjs/image")).default;
        // @ts-expect-error
        const Embed = (await import("@editorjs/embed")).default;

        let parsedData: any = {blocks: []};
        if (data) {
            try {
                parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                parsedData = { blocks: [{ type: "paragraph", data: { text: data } }] };
            }
        }

        editorRef.current = new EditorJS({
            holder: "editorjs-container",
            data: parsedData,
            placeholder: "Naciśnij TAB lub kliknij przycisk '+', aby dodać nowy nagłówek, obrazek lub tekst...",
            tools: {
                header: Header,
                list: List,
                image: {
                    class: ImageTool,
                    config: {
                        endpoints: {
                            byFile: "/api/admin/upload",
                        }
                    }
                },
                embed: {
                    class: Embed,
                    config: {
                        services: {
                            youtube: true,
                            vimeo: true,
                        }
                    }
                }
            },
            onChange: async () => {
                if (editorRef.current) {
                    const content = await editorRef.current.saver.save();
                    onChange(JSON.stringify(content));
                }
            },
        });
    };

    return (
        <div className="w-full min-h-[400px] cursor-text">
            <div id="editorjs-container" className="prose max-w-none dark:prose-invert"></div>
        </div>
    );
}