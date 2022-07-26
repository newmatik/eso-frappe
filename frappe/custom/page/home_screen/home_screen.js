frappe.pages['home-screen'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Home Screen',
		single_column: true
	});
}