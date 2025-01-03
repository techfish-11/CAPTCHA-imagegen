const express = require('express');
const { createCanvas } = require('canvas');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;

function generateRandomString(length = 6) {
    return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

function generateCaptcha(difficulty) {
    const width = 350;
    const height = 120;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'white';
    ctx.fillRect(0, 0, width, height);

    const captchaText = generateRandomString(6);

    const noiseAmount = difficulty * 20;

    for (let i = 0; i < noiseAmount; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? 'white' : 'black';
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    for (let i = 0; i < noiseAmount; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'black';
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3, 0, Math.PI * 2, false);
        ctx.fill();
    }

    ctx.font = `${Math.random() * 10 + 30}px ${difficulty > 5 ? 'Impact' : 'Arial'}`;
    ctx.fillStyle = Math.random() > 0.5 ? 'black' : 'black';
    
    for (let i = 0; i < captchaText.length; i++) {
        const xPos = 40 + i * 50 + Math.random() * 10;
        const yPos = 70 + Math.random() * 10;

        const rotation = (Math.random() - 0.5) * Math.PI / 4;

        ctx.save();
        ctx.translate(xPos, yPos);
        ctx.rotate(rotation);
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
    }

    return {
        image: canvas.toBuffer(),
        answer: captchaText
    };
}

app.get('/api/captcha', (req, res) => {
    const difficulty = parseInt(req.query.difficulty) || 10;
    if (difficulty < 1 || difficulty > 10) {
        return res.status(400).json({ error: 'Difficulty must be between 1 and 10.' });
    }

    const captcha = generateCaptcha(difficulty);

    res.json({
        image: `data:image/png;base64,${captcha.image.toString('base64')}`,
        answer: captcha.answer
    });
});

app.use('/client', express.static(path.join(__dirname, 'client')));

app.listen(port, () => {
    console.log(`Captcha API listening at http://localhost:${port}`);
});
