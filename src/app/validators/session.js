const User = require("../models/User")
const { compare } = require('bcryptjs')

async function login(req, res, next) {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) return res.render("admin/session/login", {
        user: req.body,
        error: "Usuário não cadastrado!"
    })

    const passed = await compare(password, user.password)

    if (!passed) return res.render("admin/session/login", {
        user: req.body,
        error: "Senha incorreta."
    })

    req.user = user

    next()
}

async function forgot(req, res, next) {
    const { email } = req.body

    try {
        let user = await User.findOne({ where: { email } })

        if (!user) return res.render("admin/session/forgot-password", {
            user: req.body,
            error: "E-mail não cadastrado!"
        })

        req.user = user

        next()

    } catch (error) {
        console.error(error)
    }
}

async function reset(req, res, next) {
    const { email, password, token, passwordRepeat } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) return res.render("admin/session/password-reset", {
        user: req.body,
        token,
        error: "Usuário não cadastrado!"
    })

    if (password != passwordRepeat) {
        return res.render("admin/session/password-reset", {
            user: req.body,
            token,
            error: 'Senhas não combinam'
        })
    }

    if (token != user.reset_token) return res.render("admin/session/password-reset", {
        user: req.body,
        token,
        error: 'Token Inválido! Solicite uma nova recuperação de senha.'
    })

    let now = new Date()
    now = now.setHours(now.getHours())

    if (now > user.reset_token_expires) return res.render("admin/session/password-reset", {
        user: req.body,
        token,
        error: 'Token Expirado! Solicite uma nova recuperação de senha.'
    })

    req.user = user

    next()
}

module.exports = {
    login,
    forgot,
    reset
}