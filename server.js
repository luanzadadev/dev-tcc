const express = require('express');
const session = require('express-session');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'segredo123',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Carrega produtos
let produtos = [];
try {
    produtos = JSON.parse(fs.readFileSync('produtos.json', 'utf-8'));
    if (!Array.isArray(produtos)) {
        console.error('Erro: produtos.json não contém um array válido.');
        produtos = [];
    }
} catch (err) {
    console.error('Erro ao ler produtos.json:', err.message);
}

// Rotas
app.get('/', (req, res) => {
    res.render('home', { produtos, session: req.session });
});

app.get('/produto/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = produtos.find(p => p.id === id);
    
    if (!produto) {
        return res.status(404).send('Produto não encontrado');
    }
    
    res.render('produtos', { produto });
});

app.post('/reservar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return res.status(404).send('Produto não encontrado');
    }

    if (!req.session.carrinho) {
        req.session.carrinho = [];
    }

    req.session.carrinho.push(produto);
    res.redirect('/carrinho');
});

app.get('/carrinho', (req, res) => {
    const carrinho = req.session.carrinho || [];
    const total = carrinho.reduce((soma, item) => soma + item.preco, 0);
    res.render('carrinho', { carrinho, total, session: req.session });
});

app.post('/remover/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (!req.session.carrinho || req.session.carrinho.length === 0) {
        return res.redirect('/carrinho');
    }

    const index = req.session.carrinho.findIndex(p => p.id === id);
    if (index !== -1) {
        req.session.carrinho.splice(index, 1);
    }

    res.redirect('/carrinho');
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));

// nesse caso é teste de integração