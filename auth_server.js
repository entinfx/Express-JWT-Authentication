require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

let refreshTokens = [] // normally stored in DB or Redis Cache

app.listen(4000, () => {
    console.log('Listening on 3000')
})

app.use(express.json())

app.post('/login', (req, res) => {
    // * Authenticate user (find requested user in DB) [CODE OMITTED]
    const username = req.body.username
    const user = { name: username } // faking db authentication code

    // * If user found - issue access and refresh tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken) // store refresh tokens for safety
    res.json({ accessToken, refreshToken })
})

app.post('/refresh_token', (req, res) => {
    const refreshToken = req.body.refresh_token
    if (!refreshToken) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(t => t !== req.body.refreshToken)
    res.sendStatus(204)
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
}
