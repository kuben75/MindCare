"use client";

import React, { useEffect, useRef } from "react";
import { IBlockEditorProps } from "@/types/editor";
import EditorJS, { OutputData} from "@editorjs/editorjs";
import { uploadImage } from "@/lib/image-upload";

export default function BlockEditor({ data, onChange }: IBlockEditorProps) {
    const editorRef = useRef<EditorJS | null>(null);
    // Latest props without re-initialising the editor on every keystroke.
    const dataRef = useRef(data);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        // `cancelled` guards against the component unmounting while the dynamic imports load —
        // otherwise an orphaned EditorJS instance would be created and never destroyed.
        let cancelled = false;

        const initEditor = async () => {
            const EditorJSClass = (await import("@editorjs/editorjs")).default;
            const Header = (await import("@editorjs/header")).default;
            const List = (await import("@editorjs/list")).default;
            const ImageTool = (await import("@editorjs/image")).default;
            // @ts-expect-error  - no types for embed tool
            const Embed = (await import("@editorjs/embed")).default;

            if (cancelled) return;

            const initial = dataRef.current;
            let parsedData: OutputData = {blocks: []};
            if (initial) {
                try {
                    parsedData = typeof initial === 'string' ? JSON.parse(initial) : initial;
                } catch  {
                    parsedData = { blocks: [{ type: "paragraph", data: { text: initial } }] };
                }
            }

            editorRef.current = new EditorJSClass({
                holder: "editorjs-container",
                data: parsedData,
                placeholder: "Naciśnij TAB lub kliknij przycisk '+', aby dodać nowy nagłówek, obrazek lub tekst...",
                tools: {
                    header: Header,
                    list: List,
                    image: {
                        class: ImageTool,
                        config: {
                            // Custom uploader: downscales the photo in the browser first (Vercel
                            // rejects bodies over ~4.5 MB with 413) and shows a readable error.
                            uploader: {
                                uploadByFile: async (file: File) => {
                                    try {
                                        return { success: 1, file: { url: await uploadImage(file) } };
                                    } catch (error) {
                                        window.alert(error instanceof Error ? error.message : "Nie udało się wgrać zdjęcia.");
                                        return { success: 0 };
                                    }
                                },
                            },
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
                        onChangeRef.current(JSON.stringify(content));
                    }
                },
            });
        };

        void initEditor();

        return () => {
            cancelled = true;
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <div className="w-full min-h-[400px] cursor-text">
            <div id="editorjs-container" className="prose max-w-none dark:prose-invert"></div>
        </div>
    );
}
