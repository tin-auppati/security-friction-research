"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function Home(){
    //สร้าง state เอาไว้เก็บค่าว่าง
    // imageURL เริ่มต้นเป็นค่าว่าง ""
    const [imageURL, setImageURL] = useState("")
    const [captchaId, setCaptchaId] = useState("")
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null); // เก็บผลลัพธ์การตรวจ

    //timer state
    const [StartTime, setStartTime] = useState<number>(0)

    //generate
    const fetchCaptcha = async() => {
        try{
            setLoading(true); //หมุน
            setStatus(null) //ล้างผลตรวจเก่า
            setInput("") //ล้าง input
            //ยิงไปที่ go backend
            const res = await axios.get("http://localhost:8080/api/captcha")
            
            //เอา base 64 ใส่ลงใน imageurl
            setImageURL(res.data.image)
            setCaptchaId(res.data.captchaId)

            //เริ่มจับเวลาหลังโหลดรูปเสร็จ
            setStartTime(Date.now())

        } catch(error) {
            console.error("Error fetching captcha:", error);
            alert("เชื่อมต่อ backend ไม่สำเร็จ");
        } finally {
            setLoading(false)
        }

    };

    //verify
    const verifyCaptcha = async() => {
        if (!input) return

        //stop time
        const EndTime = Date.now()
        const duration = EndTime - StartTime
        try{
            // ยิง POST ไปที่ /api/verify
            const res = await axios.post("http://localhost:8080/api/verify",{
                captchaId: captchaId, // ต้องส่ง ID กลับไปยืนยันและคำตอบของ user
                answer: input,
                TimeTaken: duration
            })

            // อัปเดตสถานะตามที่ Backend ตอบกลับมา
            setStatus({
                success: res.data.success,
                message: res.data.message
            })

            // ถ้าถูก ให้ดึงโจทย์ข้อใหม่ทันที
            if (res.data.success) {
                setTimeout(fetchCaptcha, 2000)
            } else {
                //ปล่อยว่าง
                //เพื่อให้ดูว่าใช้เวลาแก้นานแค่ไหนเพื่อให้สำเร็จ
                //ถ้าแก้ไม่าสำเร็จเวลาจะไม่หยุด
            }


        } catch(error){
            console.error("Error verifying: ",error)
            alert("เกิดข้อผิดพลาดในการตรวจสอบ")
        }
    }

    useEffect(()=> {
        fetchCaptcha();
    },[]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden p-8"> 
                
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Security Friction Research
                </h1>

                <div className="flex flex-col items-center gap-6">
                
                {/* ส่วนแสดงรูปภาพ */}
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-100 flex items-center justify-center w-full min-h-[100px] relative">
                    {loading ? (
                    <span className="text-gray-400 animate-pulse">Loading...</span>
                    ) : imageURL ? (
                    <img src={imageURL} alt="CAPTCHA" className="h-16 object-contain" />
                    ) : (
                    <span className="text-red-400">Error loading image</span>
                    )}
                </div>

                {/* ส่วนกรอกข้อมูล */}
                <div className="w-full space-y-4">
                    <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && verifyCaptcha()} // กด Enter เพื่อส่งได้เลย
                    placeholder="Type exactly as shown (Case Sensitive)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-center text-lg tracking-widest text-black"
                    />
                    
                    {/* ปุ่มส่งตรวจ */}
                    <button
                    onClick={verifyCaptcha}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                    Verify Answer
                    </button>

                    {/* ปุ่มขอใหม่ */}
                    <button
                    onClick={fetchCaptcha}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
                    >
                    Get New Image
                    </button>
                </div>

                {/* ส่วนแสดงผลลัพธ์ (Message) */}
                {status && (
                    <div className={`p-3 rounded-lg w-full text-center font-bold ${
                    status.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                    {status.message}
                    </div>
                )}

                </div>
            </div>
        </main>
    );
}