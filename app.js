require('dotenv').config(); //
const express = require('express');
const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3'); //

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 및 JSON 설정
const STATIC_PATH = process.env.STATIC_PATH || 'src'; // 환경변수가 없으면 기본값 'src' 사용
app.use(express.static(path.join(__dirname, STATIC_PATH)));

// 1. AWS S3 Client 설정 (SDK v3 방식)
const s3 = new S3Client({
    region: process.env.AWS_REGION, //
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY, //
        secretAccessKey: process.env.AWS_SECRET_KEY, //
    }
});

// 로그인 인증 상태 관리용 변수
let isAuthenticated = false;

// 2. Multer S3 설정 (에러 원인이던 ACL 제거)
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME, //
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, `gallery/${Date.now()}_${file.originalname}`); //
        }
    })
});

// [API] 관리자 로그인
app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) { //
        isAuthenticated = true;
        res.json({ success: true });
    } else {
        isAuthenticated = false;
        res.status(401).json({ success: false });
    }
});

// [API] S3 이미지 업로드 (인증된 사용자만 가능)
app.post('/upload', (req, res, next) => {
    if (!isAuthenticated) return res.status(403).json({ message: "인증 필요" });
    next();
}, upload.single('image'), (req, res) => {
    res.json({ success: true, imageUrl: req.file.location }); //
});

// [API] 이미지 목록 가져오기 (v3 ListObjectsV2Command 적용)
app.get('/images', async (req, res) => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME,
            Prefix: 'gallery/'
        });
        const data = await s3.send(command);

        const urls = (data.Contents || [])
            .filter(item => item.Size > 0)
            .map(item => `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`);

        res.json(urls);
    } catch (err) {
        console.error("S3 목록 불러오기 에러:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));