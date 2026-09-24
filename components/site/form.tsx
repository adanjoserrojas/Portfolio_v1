"use client"
import {useState, useEffect} from "react"
import { Check } from "lucide-react";


export default function Form() {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [message, setMessage] = useState("");
    const [submit, setSubmit] = useState<"iddle" | "loading" | "submitted">("iddle");

    // Visual Effect of check mark appearing
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (submit === "submitted"){
            setVisible(false);

            const timer = setTimeout(() => {
                setVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [submit]);

    // Handle timeout
    const handleSubmit = async () => {
        setSubmit("loading");
        try {
            await submitForm();

            setTimeout(() => {
                setSubmit("submitted");
            }, 1000);
        } catch (error) {
            console.error(error);

            setSubmit("iddle");
        }
    };

    // POST req submission
    const submitForm = async () => {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                contact,
                message,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to submit request!");
        }

        return response.json();
    }
    
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
                <div className={`w-40 h-40 flex p-4 items-center ${visible ? "bg-ink opacity-100" : "bg-transparent opacity-0"} 
                justify-center rounded-full transition-color duration-500 bg-ink`}>
                    <Check className="w-20 h-20 text-surface"/>
                </div>
                <p className="p-4 text-ink">Your message has been submitted to me!</p>
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

            <input
                type="text"
                value={contact}
                onChange={(a) => setContact(a.target.value)}
                placeholder="Enter your point of contact (email or phone number)"
                className="mb-8 w-full p-4"/>
            
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