const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

var ip = require('ip');

const dbFunctions = require('../private/db/db.js');

// Index (Home)
router.get('/', async (req, res) => {
    return res.render('index');
});

// Index (Home Error)
router.get('/index', async (req, res) => {
    return res.redirect('/');
});

// Votação
router.get('/votacao', async (req, res) => {
    return res.render('404');
});

// router.post('/votacao', async (req, res) => {

// });

// Login Default
router.get('/login', async (req, res) => {
    // return res.render('login');
    return res.render('404');
});

// Register Default
router.get('/register', async (req, res) => {
    // return res.render('register');
    return res.render('404');
});

router.get('/loja', async (req, res) => {
    const rows = await dbFunctions.getProdutos();
    return res.render('loja-offline', { produtos: rows[0], aviso: '' });
});

router.get('/compraok', async (req, res) => {
    const rows = await dbFunctions.getProdutos();
    return res.render('loja', { produtos: rows[0], aviso: 'Sucesso' });
});

module.exports = router;