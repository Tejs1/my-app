const express = require("express")
const app = express()
const port = 3000

app.use(express.json({ limit: "50mb" }))

app.post("/stream", (req, res) => {
	const frame = req.body.frame
	// Process the frame here (e.g., save to file, forward to another service, etc.)
	// view fram inconsole
	console.log(frame)

	console.log("Received frame")
	res.sendStatus(200)
})

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`)
})
