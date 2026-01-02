package main

import (
    "net/http"
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    // ตั้งค่า CORS ให้ Frontend Port 3000 ยิงเข้ามาได้
    config := cors.DefaultConfig()
    config.AllowOrigins = []string{"http://localhost:3000"}
    config.AllowMethods = []string{"GET", "POST", "OPTIONS"}
    config.AllowHeaders = []string{"Origin", "Content-Type"}
    r.Use(cors.New(config))

    // สร้าง Route ทดสอบ Ping
    r.GET("/api/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Pong! From Go Backend",
            "status":  "success",
        })
    })

    // รัน Server ที่ Port 8080
    r.Run(":8080")
}