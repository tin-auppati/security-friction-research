"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home(){
    //สร้าง state เอาไว้เก็บค่าว่าง
    // imageURL เริ่มต้นเป็นค่าว่าง ""
    const [imageURL, setImageURL] = useState("")
    const [loading, setLoading] = useState(false);


    //ขโมยรูปจาก backend
    const fetchCaptcha = async() => {
        try{
            setLoading(true); //หมุน
            //ยิงไปที่ go backend
            const res = await axios.get("http://localhost:8080/api/captcha")
            
            //เอา base 64 ใส่ลงใน imageurl
            setImageURL(res.data.image)
        } catch(error) {
            console.error("Error fetching captcha:", error);
            alert("เชื่อมต่อ backend ไม่สำเร็จ");
        } finally {
            setLoading(false)
        }

    };

    useEffect(()=> {
        fetchCaptcha();
    },[]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-clear bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8">
                {/* หัวข้อ */}
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Security Friction Research
                </h1>

                <div className="flex flex-col items-center gap-6">
                    {/* กล่องแสดงรูป CAPTCHA */}
                    <div className="boarder-2 boarder-gray-200 rounded-lg p-4 bg-gray-100 flex items-center justify-center w-full min-h-[100px]">
                        {loading ? (
                            <span className="text-gray-200 animate-pulse">Loading...</span>
                        ) : imageURL ? (
                            //เอา base64 มาแสดงเป็นรูป
                            <img src={imageURL} alt="CAPTCHA" className="h-16 object-contain" />
                        ) : (
                            <span className="text-red-400">No Image</span>
                        )}
                    </div>

                    {/* ช่องกรอกข้อมูล (ยังไม่ได้ทำระบบตรวจ) */}
                    <input 
                        type="text"
                        placeholder="Type charactors above"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-lg tracking-widest uppercase text-black"
                        />
                    {/* ปุ่มรีเฟรช */}

                    <button
                        onClick={fetchCaptcha}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                        >
                    New Challenge
                    </button>
                </div>
            </div>
        </main>
    )

};
