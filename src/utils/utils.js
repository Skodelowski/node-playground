const removeFromStudents = (array, studentName) => {
  let formattedName = studentName.replaceAll('%20', ' ')
  for (let student of array) {
    if (student.name === formattedName) {
      array.splice(array.indexOf(student), 1)
    }
  }
  return array
}

const addStudent = (array, data) => {
  let inputs = []
  let student = {}
  inputs = data.split('&')
  inputs.map((input) => {
    let entry = input.split('=')
    let formattedRes = entry[1].replaceAll('+', ' ')
    if (entry[0] === 'name') student.name = formattedRes
    if (entry[0] === 'birth') student.birth = formattedRes
  })
  if (student.name !== '' && student.birth !== '') array.push(student)

  return array
}

const editStudent = (array, data) => {
  let inputs = []
  inputs = data.split('&')
  let formerName = inputs[0].split('=')[1].replaceAll('+', ' ')
  let name = inputs[1].split('=')[1]
  let birth = inputs[2].split('=')[1]
  for (let line of array) {
    if (line.name === formerName) {
      line.name = name !== formerName ? name.replaceAll('+', ' ') : formerName
      line.birth = birth !== line.birth ? birth : line.birth
    }
  }
  return array
}

export { removeFromStudents, addStudent, editStudent }
