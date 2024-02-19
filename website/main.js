const CLIENT_ID = "1198393663882014791"
const CLIENT_SECRET = "G9B2z9xjlupIQFwCUykRS_1KcJD800R4"

const REDIRECT_URI = "http://localhost:3000/"

var query = {}

var search_params = (new URLSearchParams(window.location.href.split("?")[1]))
var search_keys = Array.from(search_params.keys())
var search_values = Array.from(search_params.values())
search_keys.forEach((key, ind) => {
	var value = search_values[ind]
	query[key] = value
})

print(query)

var new_search_params = new URLSearchParams({
	"client_id": CLIENT_ID,
	"client_secret": CLIENT_SECRET,
	"grant_type": "client_credentials",
	"scope": "applications.commands applications.commands.permissions.update",
})

fetch("https://discord.com/api/v10/oauth2/token", {
	method: "POST",
	headers: {
		"Content-Type": "application/x-www-form-urlencoded"
	},
	body: new_search_params.toString()
}).then(async response => {
	var data = await response.json()

	var codeElem = new Elem("access_token")
	codeElem.text = data.access_token
})