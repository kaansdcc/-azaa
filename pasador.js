const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { Strategy } = require("passport-discord");
const mongoose = require("mongoose");
const Blog = require("./veri.js");
const bp = require("body-parser");
const fetch = require("node-fetch")
mongoose.connect("mongodb+srv://nnn:ekoonay111@cluster0.kfhmift.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true })
    .then(() => console.log("[DATABASE] Veritabanına başarıyla bağlantı sağlandı!"))
    .catch(error => console.log("[DATABASE] Veritabanında hata oluştu!", error.message));

const app = express();

app.use(bp.urlencoded({ extended: false }))

app.use(bp.json())

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const strategy = new Strategy(
	{
		clientID: "952955873859350548",
		clientSecret: "fpar6S7XZSkFdhH5bcpkRSNnUVblANIX",
		callbackURL: "https://impartial-foremost-painter.glitch.me/callback", //callback url
		scope: ["identify"],
	},
	(_access_token, _refresh_token, user, done) =>
		process.nextTick(() => done(null, user)),
);

passport.use(strategy);

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(passport.session());
app.use(passport.initialize());

app.get(
	"/giris",
	passport.authenticate("discord", {
		scope: ["identify"],
	}),
);

app.get(
	"/callback",
	passport.authenticate("discord", {
		failureRedirect: "/hata",
	}),
	(_req, res) => res.redirect("/"),
);

app.get("/", (req, res) => {
	res.render(process.cwd() + "/pub/main.ejs", { user: req.user })
});

app.get("/yonetim", (req, res) => {
	res.render(process.cwd() + "/pub/dash.ejs", { user: req.user })
});

app.get("/cikis", (req, res) => {
    req.session.destroy();
    return res.redirect("/");
  });

app.get("/discord", (req, res) => {
    res.redirect("discordSunucuLinkiniz") 
})


setInterval(() => {
    mongoose.connect("mongodb+srv://nnn:ekoonay111@cluster0.kfhmift.mongodb.net/?retryWrites=true&w=majority", function (err,db) {
    var uptime = db.collection("uptimes");
    uptime.find({}).toArray(function (err, result){  
      result.forEach(site =>{
		fetch(site.link)
      })
    })
  });
}, 60000)

app.post("/yonetim", (req, res) => {
	if(req.user){
            const blog = new Blog({
                "link": req.body.link,
                "id": req.user.id
            })
            blog.save()
    return res.redirect("/yonetim")
    }
})

app.listen(3000, () => {
	console.log("[START] Site başarıyla aktif edildi!");
});
