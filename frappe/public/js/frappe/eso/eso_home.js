import Home from './Home.vue';

frappe.provide('frappe.eso');

frappe.eso.Home = class EsoHome {
	constructor({ parent }) {
		this.$parent = $(parent);
		this.page = parent.page;
		this.setup_header();
		this.make_body();
	}
	make_body() {
		this.$social_container = this.$parent.find('.layout-main');
		console.log(this.$social_container[0])
		frappe.require('/assets/js/frappe-vue.min.js', () => {
			new Vue({
				el: this.$social_container[0],
				render: h => h(Home)
			});
		});
	}
	setup_header() {
		this.page.set_title(__('Eso'));
	}
};

frappe.eso.is_home_page = () => {
	return frappe.get_route()[0] === 'eso' && frappe.get_route()[1] === 'home';
};


frappe.provide('frappe.app_updates');

frappe.utils.make_event_emitter(frappe.app_updates);
