// =========================================
// Node.JS app for the ADP screening process
// Tiago Bortoluzzi, 2022
// =========================================

// Function to fetch data from API
const getData = async () => {
  const res = await fetch('https://interview.adpeai.com/api/v1/get-task')

  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} - ${res.statusText}`)

  return await res.json()
}

// Function to check received data - throws error if necessary
const checkData = (data) => {
  if (data.right === 0 && (data.operation === 'division' || data.operation === 'remainder')) throw new Error('Cannot divide by zero')
  if ([data.id, data.operation, data.left, data.right].includes(undefined)) throw new Error('Missing data')
}

// Function to calculate the result - throws an error if unexpected operation
const calculateResult = (operation, left, right) => {
  switch (operation) {
    case 'addition':
      return left + right
    case 'subtraction':
      return left - right
    case 'multiplication':
      return left * right
    case 'division':
      return left / right
    case 'remainder':
      return left % right
    default:
      throw new Error('Unexpected operation: ' + operation)
  }
}

// Function to post result to API
const postResult = async (data, result) => {
  const res = await fetch('https://interview.adpeai.com/api/v1/submit-task', {
    method: 'POST',
    body: JSON.stringify({
      id: data.id,
      result
    }),
    headers: {
      'Content-type': 'application/json'
    }
  })

  if (!res.ok) throw new Error(`Failed to post result: ${res.status} - ${res.statusText}`)

  console.log(`SUCCESS: ${data.operation} ${data.left} <-> ${data.right} = ${result}`)
}

// Function to run sequential process
const runProcess = async () => {
  // Runs sequential steps - logs error if necessary
  try {
    const data = await getData()
    checkData(data)
    const result = calculateResult(data.operation, data.left, data.right)
    await postResult(data, result)
  } catch (error) {
    console.log('ERROR: ' + error.message)
  }
  // Restarts after a delay
  setTimeout(runProcess, 2000)
}

// Starts process
runProcess()
