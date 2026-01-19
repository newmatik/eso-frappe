const { get_conf } = require("../node_utils");
const conf = get_conf();

function get_url(socket, path) {
	if (!path) {
		path = "";
	}
	let url = socket.request.headers.origin;
	// Only modify the URL for local development (when origin includes a non-standard port)
	// For production with nginx proxy, use the origin as-is
	if (conf.developer_mode) {
		let parts = url.split(":");
		// Only add webserver_port if the URL already has a port (local dev scenario)
		// e.g., http://localhost:8001 has 3 parts when split by ":"
		if (parts.length > 2) {
			let [protocol, host] = parts;
			url = `${protocol}:${host}:${conf.webserver_port}`;
		}
	}
	return url + path;
}

module.exports = {
	get_url,
};
