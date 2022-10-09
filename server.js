require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.listen(3000, () => {
    console.log('Listening on 3000')
})

app.use(express.json())

const posts = [
    { username: "Jim", title: "I like Pam!"},
    { username: "Dwight", title: "MICHAEL!"}
]

app.get('/posts', verifyAccessToken, (req, res) => {
    res.json(posts.filter(p => p.username === req.user.name))
})

function verifyAccessToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]
    if (!token) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) return res.sendStatus(403)
        req.user = user
        next()
    })
}
