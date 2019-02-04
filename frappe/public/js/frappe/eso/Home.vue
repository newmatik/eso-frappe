<template>
	<div ref="eso" class="eso">
		 This is Home
		 <Wall />
	</div>
</template>

<script>

import Wall from './pages/Wall.vue';
import NotFound from './components/NotFound.vue';

function get_route_map() {
	return {
		'eso/home': {
			'component': Wall,
			'props': {}
		},
		'not_found': {
			'component': NotFound,
		}
	}
}

export default {
	components: {
		Wall
	},
	data() {
		return {
			current_page: this.get_current_page(),
		}
	},
	created() {
	},
	mounted() {
		frappe.route.on('change', () => {
			if (frappe.get_route()[0] === 'eso') {
				this.set_current_page();
				frappe.utils.scroll_to(0);
				$("body").attr("data-route", frappe.get_route_str());
			}
		});
	},
	methods: {
		set_current_page() {
			this.current_page = this.get_current_page();
		},
		get_current_page() {
			const route_map = get_route_map();
			const route = frappe.get_route_str();
			if (route_map[route]) {
				return route_map[route];
			} else {
				return route_map[route.substring(0, route.lastIndexOf('/')) + '/*'] || route_map['not_found']
			}
		},
	}
}
</script>
