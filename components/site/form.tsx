"use client"
import {useState, useEffect} from "react"
import { Check } from "lucide-react";


export default function Form() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [submit, setSubmit] = useState<"iddle" | "loading" | "submitted">("iddle");

    // Visual Effect of check mark appearing
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (submit === "submitted"){
            setVisible(false);

            const timer = setTimeout(() => {
                setVisible(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [submit]);

    // Handle timeout
    const handleSubmit = () => {
        setSubmit("loading");

        setTimeout(() => {
            setSubmit("submitted");
        }, 1000);
    };
    
    if (submit === "loading"){
        return (
            <main className="flex items-center justify-center">
                <svg
                viewBox="0 0 120 12"
                className="w-32 text-[#e6e8ea]"
                >
                    <rect
                        x="50"
                        y="2"
                        width="20"
                        height="8"
                        rx="4"
                        fill="currentColor"
                    >
                        <animate
                        attributeName="width"
                        values="20;120;20"
                        dur="1.2s"
                        repeatCount="indefinite"
                        />
                        <animate
                        attributeName="x"
                        values="50;0;50"
                        dur="1.2s"
                        repeatCount="indefinite"
                        />
                    </rect>
                </svg>
            </main>
        );
    } else if (submit == "submitted"){

        return (
            <div className={`flex flex-col p-4 items-center justify-center ${visible ? "opacity-100" : "opacity-0"}`}>
                <div className={`w-40 h-40 flex p-4 items-center 
                justify-center rounded-full transition-color duration-500 bg-[#e6e8ea]`}>
                    <Check className="w-20 h-20 text-[#0d0f11]"/>
                </div>
                <p className="p-4 text-[#e6e8ea]">Your message has been submitted to me!</p>
            </div>
            
        );

    } else {
        return(
        <main className="grid px-4">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mb-8 w-min p-4"/>
            
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                className="w-full resize-none overflow-hidden min-h-[40px] p-4 boder rounded-md"
                onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}/>
            <button className="max-w-full whitespace-normal break-words bg-white/20 rounded-md hover:cursor-pointer hover:bg-white/60 transition-colors p-4 mt-8 duration-500"
                    onClick={handleSubmit}>
                <p className="text-black">Submit</p>
            </button>
        </main>
    );
    }  
}