package handlers

import (
	"bytes"
	"encoding/base64"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/steambap/captcha"
)

// Global Variable ชั่วคราว (ในของจริงจะใช้ Redis หรือ Database)
// key = capchaId, value
var captchaStore = make(map[string]string)

// ส่งกลับไป frontend
type CaptchaResponse struct {
	CaptchaID string `json:"captchaId"`
	ImageURL  string `json:"imageUrl"` //base 64
}

func GenerateCaptcha(c *gin.Context) {
	// รูปภาพขนาด กว้าง150px สูง 50px
	data, err := captcha.New(150, 50)
	if err != nil {
		c.JSON(500, gin.H{"error": "สร้าง Captch ไม่สำเร็จ"})
		return
	}

	var buf bytes.Buffer
	//เขียนรูปภาพลงใน buffer
	if err := data.WriteImage(&buf); err != nil {
		c.JSON(500, gin.H{"error": "แปลงรูปภาพไม่สำเร็จ"})
		return
	}

	//เก็บคำตอบลงใน memory map base 64
	imgBase64Str := base64.StdEncoding.EncodeToString(buf.Bytes())
	finalImageURL := "data:image/png;base64," + imgBase64Str

	//จำคำตอบไว้ใน database ตอนนี้ส่งขึ้น console ดูก่อน
	println("Admin Cheat Sheet - Answer is: ", data.Text)

	//ส่ง JSON กลับไปหา frontend
	c.JSON(http.StatusOK, gin.H{
		"image": finalImageURL,
		"text":  data.Text, //ส่ง test เฉยๆเดี๋ยวลบ
	})
}
