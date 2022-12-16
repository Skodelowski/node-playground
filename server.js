console.clear()
console.log(`******************* SERVER LOADED *******************`)

import http from 'http'
import fs from 'fs'
import pug from 'pug'
import dotenv from 'dotenv'
import dayjs from 'dayjs'
import {
  removeFromStudents,
  addStudent,
  editStudent,
} from './src/utils/utils.js'

// Environment
dotenv.config()
const { APP_LOCALHOST: hostname, APP_PORT: port } = process.env

// Views
const homepage = './views/pages/home.pug'
const userspage = './views/pages/users.pug'
const userpage = './views/pages/user.pug'
const errorpage = './views/pages/error.pug'

// Datas
var students = [
  { name: 'Sonia', birth: '2019-05-14' },
  { name: 'Antoine', birth: '2000-05-12' },
  { name: 'Alice', birth: '1990-09-14' },
  { name: 'Sophie', birth: '2001-02-10' },
  { name: 'Bernard', birth: '1980-08-21' },
]

// Server
const server = http.createServer((req, res) => {
  const url = req.url.split('?')
  const argUrl = url[0].split('/')

  // CSS
  if (argUrl[1] === 'styles') {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    const css = fs.readFileSync('./assets/css/styles.css')
    res.write(css)
    res.end()
    return
  }

  // Favicon
  if (argUrl[1] === 'favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' })
    res.end()
    return
  }

  // Homepage
  if (argUrl[1] === '') {
    let message = false
    if (url[1]) {
      message = true
    }
    pug.renderFile(
      homepage,
      { pretty: true, students, message },
      (err, data) => {
        if (err) throw err
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      },
    )
    return
  }

  // Form
  if (req.method === 'POST' && argUrl[1] === 'add') {
    let form = ''
    req.on('data', (data) => {
      form += data
      students = addStudent(students, form)
    })

    req.on('end', () => {
      res.writeHead(301, { Location: '/?1' })
      res.end()
    })
    return
  }

  // Users
  if (argUrl[1] === 'users') {
    pug.renderFile(
      userspage,
      { pretty: true, students, dayjs },
      (err, data) => {
        if (err) throw err
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      },
    )
    return
  }

  // Delete user
  if (argUrl[1] === 'del') {
    let name = url[1].split('=')[1]
    students = removeFromStudents(students, name)
    pug.renderFile(
      userspage,
      { pretty: true, students, dayjs },
      (err, data) => {
        if (err) throw err
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      },
    )
    return
  }

  // Edit user form
  if (argUrl[1] === 'edit' && req.method === 'POST') {
    let form = ''
    let updatedName = ''
    req.on('data', (data) => {
      form += data
      students = editStudent(students, form)
      updatedName = form.split('&')[1].split('=')[1].replaceAll('+', '%20')
    })

    req.on('end', () => {
      res.writeHead(301, { Location: `/edit/${updatedName}/?1` })
      res.end()
    })
    return
  }

  // Edit user
  if (argUrl[1] === 'edit') {
    let message = false
    if (url[1]) {
      message = true
    }
    let name = argUrl[2].replaceAll('%20', ' ')
    let student = {}
    for (let target of students) {
      if (name === target.name) student = target
    }
    pug.renderFile(
      userpage,
      { pretty: true, student, message },
      (err, data) => {
        if (err) throw err
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      },
    )
    return
  }

  // Error 404
  pug.renderFile(errorpage, (err, data) => {
    if (err) throw err
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end(data)
  })
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
