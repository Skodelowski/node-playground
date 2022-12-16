console.clear()
console.log(`******************* SERVER LOADED *******************`)

import http from 'http'
import fs from 'fs'
import pug from 'pug'
import dotenv from 'dotenv'
import dayjs from 'dayjs'
import studentsTab from './Data/students.js'
import {
  removeFromStudents,
  addStudent,
  editStudent,
} from './src/utils/utils.js'

// Environment
dotenv.config()
const { APP_LOCALHOST: hostname, APP_PORT: port } = process.env

// To var
let students = studentsTab

// Views
const homepage = './views/pages/home.pug'
const userspage = './views/pages/users.pug'
const userpage = './views/pages/user.pug'
const errorpage = './views/pages/error.pug'

// Server
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0]
  let params = new URLSearchParams(req.url.split('?')[1])

  // CSS
  if (url === '/styles') {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    const css = fs.readFileSync('./assets/css/styles.css')
    res.write(css)
    res.end()
    return
  }

  // Favicon
  if (url === '/favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' })
    res.end()
    return
  }

  // Homepage
  if (url === '/') {
    let message = false
    if (params.get('created')) {
      message = true
    }
    pug.renderFile(homepage, { pretty: true, message }, (err, data) => {
      if (err) throw err
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(data)
    })
    return
  }

  // Form
  if (url === '/add' && req.method === 'POST') {
    let form = ''
    req.on('data', (data) => {
      form += data
      students = addStudent(students, form)
    })

    req.on('end', () => {
      res.writeHead(301, { Location: '/?created=1' })
      res.end()
    })
    return
  }

  // Users
  if (url === '/users') {
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
  if (url === '/del') {
    let name = params.get('student')
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
  if (url === '/edit' && req.method === 'POST') {
    let form = ''
    let updatedName = ''
    req.on('data', (data) => {
      form += data
      students = editStudent(students, form)
      updatedName = form.split('&')[1].split('=')[1].replaceAll('+', '%20')
    })

    req.on('end', () => {
      res.writeHead(301, { Location: `/edit?student=${updatedName}&edited=1` })
      res.end()
    })
    return
  }
  // Edit user
  if (url === '/edit') {
    let message = false
    if (params.get('edited')) {
      message = true
    }
    let name = params.get('student')
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
