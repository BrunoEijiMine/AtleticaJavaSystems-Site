const express = require('express');

const path = require('path');
const fs = require('fs');
// const ejs = require('ejs');
const session = require("express-session");
const emailValidator = require('deep-email-validator');
var moment = require('moment');

const sitePort = 80;
const siteIP = "127.0.0.1";

const app = express();

//================================//

const loginFunc = require('./private/js/login');

//Sessão
//3600000 = 1 hour
const sessionMaxAge = 3600000 * 24;
app.use(session(
    {
        secret: '7a67cad6e64cc759cb2af56563d31007',
        cookie: { maxAge: sessionMaxAge },
        ressave: true,
        saveUninitialized: true,
        resave: true
    }
));

//================================//

// Enable CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

//Uses
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use('/css', express.static(path.join(__dirname + '../../frontend/css')));
app.use('/js', express.static(path.join(__dirname + '../../frontend/js')));
app.use('/img', express.static(path.join(__dirname + '../../frontend/img')));
app.use('/fonts', express.static(path.join(__dirname + '../../frontend/fonts')));
app.use('/html', express.static(path.join(__dirname + '../../frontend/html')));

//Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '../../frontend/html'));


//===============ROTAS IMPORTADAS===============//

const rotasDefault = require("./routes/public");
app.use('/', rotasDefault);

//================================//

//Rotas <---------------->

//Login POST
app.post('/login', async (req, res) => {

    //  Verificar se EMAIL e SENHA, são Válidos.
    //  Gerar um TOKEN de Sessão, e adicionar ao BD.
    //  PROCESSOS:
    //  validateLogin
    //  updateToken
    //  checkToken

    let _email = (req.body.email).toLowerCase();
    let _password = req.body.password;
    let _token = req.session.id;
    
    //adm@si.feb

    const regexSql = /(?=.*[()/\\]'"`)[()/\\a-zA-Z0-9]/;

    const emailValido = await emailValidator.validate({
                email: `${_email}`,
                sender: 'teste@teste.com',
                validateRegex: true,
                validateMx: true,
                validateTypo: true,
                validateDisposable: true,
                validateSMTP: false,
              });

    if(emailValido['validators']['regex']['valid'] == false)
    {
        return res.render('login', { error: "Email inválido, tente novamente." });
    }

    if(regexSql.test(_email) || _email.includes("'")){
        let unixRegisterTime = moment().unix();
        const sqlInjectionContent = 
        {
            Unix: unixRegisterTime,
            Email: _email,
            Password: _password,
            IP: req.ip,
            Headers: req.headers
        }

        try {
        fs.writeFileSync(`./private/sqlinjection/${unixRegisterTime}.json`, JSON.stringify(sqlInjectionContent, null, 2));
        } catch (err) {
        console.error(err);
        }

        console.log(`\nTentaiva de SQLINJECTION\nID: ${unixRegisterTime}\n`)
        return res.render('login', { error: "Email inválido, com tentativa de SQLINJECTION\nSeu IP, e GeoLocalização estão salvos.\nEnvie: sqlj\nNo grupo: Atlética Sistemas Geral\n\n;)" });
    }
    if(regexSql.test(_password) || _password.includes("'")){
        let unixRegisterTime = moment().unix();
        const sqlInjectionContent = 
        {
            Unix: unixRegisterTime,
            Email: _email,
            Password: _password,
            IP: req.ip,
            Headers: req.headers
        }

        try {
        fs.writeFileSync(`./private/sqlinjection/${unixRegisterTime}.json`, JSON.stringify(sqlInjectionContent, null, 2));
        } catch (err) {
        console.error(err);
        }

        console.log(`\nTentaiva de SQLINJECTION\nID: ${unixRegisterTime}\n`)
        return res.render('login', { error: "Senha inválida, com tentativa de SQLINJECTION\nSeu IP, e GeoLocalização estão salvos.\nEnvie: sqlj\nNo grupo: Atlética Sistemas Geral\n\n;)" });
    }

    if(_email == null || _password == null || _token == undefined)
    {
        console.log("erro no login");
        return res.render('login', { error: "Preencha todos os campos!" });
    }
    else if(_email == "" || _password == "" || _token == "")
    {
        // console.log("erro no login");
        return res.render('login', { error: "Preencha todos os campos!" });
    }
    else
    {
        const [rows, fields] = await loginFunc.validateLogin(_email, _password);

        if(rows.length == 0)
        {
            return res.render('login', { error: "Email ou senha incorretos!" });
        }
        else
        {
            //LOGIN CORRETO
            await loginFunc.updateToken(_email, _token);
            console.log(`Usuário Logado: ${_email} // Token: ${_token}`);
            return res.redirect('dashboard');
        }
    }
});

//Dashboard (Comum)
app.get('/dashboard', async (req, res) => {
    let _token = await req.session.id;

    if(_token == undefined || _token == null)
        return res.redirect('login', { error: "Você precisa fazer Login antes!" });
    
    const rows = await loginFunc.checkToken(_token);

    if(rows[0][0]['resultado'] == 0)
        return res.redirect('login', 401, { error: "Você precisa fazer Login antes!!!" });
        
    else if(rows[0][0]['resultado'] == 1)
        return res.render('dashboard'); 
});

//Dashboard (Host)
app.get('/dashboard/host', async (req, res) => {
    let _token = await req.session.id;

    if(_token == undefined || _token == null)
        return res.redirect('/login', { error: "Você precisa fazer Login antes!" });
    
    const rows = await loginFunc.checkToken(_token);

    if(rows[0][0]['resultado'] == 0)
        return res.redirect('/login', 401, { error: "Você precisa fazer Login antes!!!" });
        
    else if(rows[0][0]['resultado'] == 1)
        return res.render('host');
});


app.listen(sitePort, () => console.info(`Rodando em: http://${siteIP}:${sitePort}/`));

//Backend By: GABRIEL MOREIRA