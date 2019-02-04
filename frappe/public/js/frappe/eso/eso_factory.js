frappe.views.esoFactory = class esoFactory extends frappe.views.Factory {
	show() {
		console.log("Calling this shit")
		if (frappe.pages.eso) {
			frappe.container.change_to('eso');
		} else {
			this.make('eso');
		}
	}

	make(page_name) {
		const assets = [
			'/assets/js/eso.min.js'
		];

		frappe.require(assets, () => {
			frappe.eso.home = new frappe.eso.Home({
				parent: this.make_page(true, page_name)
			});
		});
	}
};
