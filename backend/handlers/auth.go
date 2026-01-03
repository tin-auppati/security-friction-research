package handlers

import (
	"bytes"
	"encoding/base64"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/steambap/captcha"
)

// ใช้ sync.Map เป็น key => value
// key = capchaId, value
var captchaStore sync.Map

// Struct สำหรับ รับ ข้อมูลจาก Frontend ตอนตรวจคำตอบ
type VerifyRequest struct {
	CaptchaID string `json:"captchaId"`
	Answer  string `json:"answer"` //base 64
}

func GenerateCaptcha(c *gin.Context) {
	// รูปภาพขนาด กว้าง150px สูง 50px
	data, err := captcha.New(150, 50)
	if err != nil {
		c.JSON(500, gin.H{"error": "สร้าง Captch ไม่สำเร็จ"})
		return
	}

	//สร้าง ID ประจำตัว TOken
	realID := uuid.New().String()

	//เก็บลงเซฟ
	captchaStore.Store(realID,data.Text)

	var buf bytes.Buffer
	//เขียนรูปภาพลงใน buffer
	if err := data.WriteImage(&buf); err != nil {
		c.JSON(500, gin.H{"error": "แปลงรูปภาพไม่สำเร็จ"})
		return
	}

	//เก็บคำตอบลงใน memory map base 64
	imgBase64Str := base64.StdEncoding.EncodeToString(buf.Bytes())
	finalImageURL := "data:image/png;base64," + imgBase64Str

	//ส่ง JSON กลับไปหา frontend
	c.JSON(http.StatusOK, gin.H{
		"captchaId": realID,
		"image":  finalImageURL, //ส่ง test เฉยๆเดี๋ยวลบ
	})
}

func VerifyCaptcha(c *gin.Context){
	var req VerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil{
		c.JSON(400, gin.H{"error": "Invalid request"})
		return
	}

	actualAnswer, ok := captchaStore.Load(req.CaptchaID)

	if !ok {
		c.JSON(400,gin.H{"success": false, "message" : "ID ไม่ถูกต้องหรือหมดอายุ"})
	}

	if req.Answer == actualAnswer.(string){
		captchaStore.Delete(req.CaptchaID)
		c.JSON(200, gin.H{"success":true, "message": "Correct!"})
	}else{
		c.JSON(200,gin.H{"success":false, "message": "Incorrect!"})
	}
}