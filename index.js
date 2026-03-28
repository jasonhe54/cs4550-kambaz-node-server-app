import express from 'express'
import hello from './hello.js'
import lab5 from './lab5/index.js'

const app = express()
lab5(app)
hello(app)
app.listen(4000)