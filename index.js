const content = document.getElementById("content")
const colors = new Map()

const languageColor = async () => {
	const response = await fetch("https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml")
	const text = await response.text()
	const lines = text.split("\n")

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		if (line.startsWith(" ") || line.startsWith("#")) {
			continue;
		}

		const language = line.substring(0, line.indexOf(":"))
		if (!language) {
			continue;
		}

		for (let j = i; j < lines.length; j++) {
			if (lines[j].includes("color:")) {
				const color = lines[j].substring(lines[j].indexOf("color:"))
				colors.set(language, color.substring(8, color.length - 1))
				i = j
				break
			}
		}
	}
}

const load = user => {
	fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=10`)
		.then(response => response.json())
		.then(json => {
			const languages = new Map()
			json.map(item => item.language).forEach(language => {
				if (!language) {
					language = "Other"
				}
				languages.set(language, languages.has(language)
					? languages.get(language) + 1
					: 1)
			})

			let html = "<table>"
			languages.forEach((uses, language) => {
				const color = colors.has(language)
					? colors.get(language)
					: ""
				html += `<tr style="color: ${color}"><td>${language}:</td><td>${uses * 10}%</td></tr>`
			})
			html += "</table>"

			content.innerHTML = html
		})
		.catch(err => content.textContent = err)
}

const params = new URLSearchParams(location.search)
if (params.has("user")) {
	languageColor().then(() => load(params.get("user")))
} else {
	content.textContent = "user parameter must be specified"
}