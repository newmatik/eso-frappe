// Copyright (c) 2020, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

class BaseTimeline {
	constructor(opts) {
		Object.assign(this, opts);
		this.make();
	}

	make() {
		this.timeline_wrapper = $(`<div class="new-timeline">`);
		this.wrapper = this.timeline_wrapper;
		this.timeline_items_wrapper = $(`<div class="timeline-items">`);
		this.timeline_actions_wrapper = $(`
			<div class="timeline-items timeline-actions">
				<div class="timeline-item">
					<div class="timeline-dot"></div>
					<div class="timeline-content action-buttons"></div>
				</div>
			</div>
		`);

		this.timeline_wrapper.append(this.timeline_actions_wrapper);
		this.timeline_actions_wrapper.hide();
		this.timeline_wrapper.append(this.timeline_items_wrapper);

		this.parent.replaceWith(this.timeline_wrapper);
		this.timeline_items = [];
	}

	refresh() {
		this.render_timeline_items();
	}

	add_action_button(label, action, icon=null, btn_class=null) {
		let icon_element = icon ? frappe.utils.icon(icon, 'xs') : null;
		this.timeline_actions_wrapper.show();
		let action_btn = $(`<button class="btn btn-xs ${btn_class || 'btn-default'} action-btn">
			${icon_element}
			${label}
		</button>`);
		action_btn.click(action);
		this.timeline_actions_wrapper.find('.action-buttons').append(action_btn);
		return action_btn;
	}

	//custom helpscout action button
	add_help_scout_action_button(label, action) {
		this.timeline_actions_wrapper.show();
		let action_btn = $(`<button class="btn btn-xs btn-primary action-btn">
			<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="249.000000pt" height="300.000000pt" viewBox="0 0 249.000000 300.000000" preserveAspectRatio="xMidYMid meet" class="icon icon-xs">
				<g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)" fill="#FFFFFF" stroke="none">
					<path d="M598 2542 c-250 -252 -467 -474 -482 -495 -145 -199 -155 -495 -23
					-697 20 -30 47 -68 61 -85 l25 -30 456 455 c251 250 477 483 501 517 137 189
					150 446 35 659 -18 32 -48 77 -68 99 -20 22 -28 29 -19 15 9 -14 33 -50 53
					-80 41 -62 93 -199 92 -245 0 -20 -5 -10 -14 30 -24 109 -67 198 -140 287
					l-22 26 -455 -456z m-4 -34 c-502 -505 -509 -513 -550 -653 -10 -33 -21 -105
					-25 -160 l-7 -100 3 105 c2 72 9 125 24 170 44 140 66 165 551 653 250 251
					459 457 464 457 6 0 -201 -213 -460 -472z m565 -250 c-28 -53 -106 -136 -503
					-536 l-470 -472 -28 27 c-30 31 -98 141 -98 157 0 6 14 -14 31 -44 16 -30 43
					-71 59 -90 l29 -35 474 475 c384 385 479 486 503 532 15 31 30 55 32 53 2 -2
					-11 -32 -29 -67z"/>
					<path d="M1593 2288 c-392 -391 -713 -714 -713 -717 0 -3 321 314 712 704 392
					391 229 224 -363 -370 -592 -594 -1091 -1101 -1108 -1127 -38 -57 -68 -125
					-87 -198 -12 -47 -13 -49 -9 -13 3 23 7 50 10 60 3 10 -2 2 -11 -17 -11 -23
					-18 -73 -22 -145 -5 -125 9 -199 58 -301 33 -69 104 -164 122 -164 15 0 898
					880 898 895 0 5 -200 -191 -445 -435 -245 -245 -449 -446 -454 -448 -12 -4
					-72 80 -105 146 -41 82 -66 193 -64 286 l1 81 7 -100 c10 -153 56 -283 132
					-368 l33 -38 1086 1088 c922 923 1092 1098 1123 1153 19 36 36 61 36 55 0 -5
					-18 -39 -39 -75 -29 -47 -127 -152 -372 -397 -183 -183 -329 -333 -323 -333 6
					0 161 152 345 338 311 312 338 343 376 417 58 114 77 200 70 327 -7 151 -41
					241 -140 371 -16 20 -32 37 -35 37 -4 0 -328 -320 -719 -712z"/>
					<path d="M1824 1278 c-454 -457 -481 -487 -516 -558 -108 -224 -85 -463 64
					-664 23 -31 43 -54 46 -52 2 3 -11 24 -30 48 -19 24 -44 59 -56 78 -28 47 -72
					182 -71 217 0 16 7 0 15 -37 15 -72 79 -207 121 -258 l28 -33 466 468 c371
					372 474 481 504 533 20 36 34 56 30 45 -23 -74 -94 -152 -533 -592 -255 -256
					-462 -466 -460 -469 3 -2 216 209 474 469 446 448 472 476 512 553 58 113 75
					194 69 324 -5 127 -36 223 -99 317 -24 34 -46 63 -50 63 -3 0 13 -29 37 -64
					48 -72 82 -154 90 -219 4 -29 -1 -20 -14 29 -24 89 -57 155 -112 224 -24 31
					-35 51 -25 47 10 -4 15 -3 11 3 -3 6 -9 10 -13 10 -4 0 -224 -217 -488 -482z
					m21 -7 c-482 -480 -506 -508 -553 -640 -14 -41 -21 -52 -18 -31 3 19 25 73 47
					120 41 84 49 92 507 552 256 257 468 465 471 462 3 -3 -201 -211 -454 -463z"/>
					<path d="M514 1217 c-193 -193 -367 -372 -386 -397 -38 -48 -88 -141 -88 -162
					0 -7 15 17 34 54 18 36 43 79 55 95 12 15 187 193 389 395 202 203 363 368
					357 368 -5 0 -168 -159 -361 -353z"/>
				</g>
		 	</svg>
			${label}
		</button>`);
		action_btn.click(action);
		this.timeline_actions_wrapper.find('.action-buttons').append(action_btn);
		return action_btn;
	}

	render_timeline_items() {
		this.timeline_items_wrapper.empty();
		this.timeline_items = [];
		this.doc_info = this.frm && this.frm.get_docinfo() || {};
		let response = this.prepare_timeline_contents();
		if (response instanceof Promise) {
			response.then(() => {
				this.timeline_items.sort((item1, item2) =>  new Date(item2.creation) - new Date(item1.creation));
				this.timeline_items.forEach(this.add_timeline_item.bind(this));
			});
		} else {
			this.timeline_items.sort((item1, item2) =>  new Date(item2.creation) - new Date(item1.creation));
			this.timeline_items.forEach(this.add_timeline_item.bind(this));
		}
	}

	prepare_timeline_contents() {
		//
	}

	add_timeline_item(item, append_at_the_end=false) {
		let timeline_item = this.get_timeline_item(item);
		if (append_at_the_end) {
			this.timeline_items_wrapper.append(timeline_item);
		} else {
			this.timeline_items_wrapper.prepend(timeline_item);
		}
		return timeline_item;
	}

	add_timeline_items(items, append_at_the_end=false) {
		items.forEach((item) => this.add_timeline_item(item, append_at_the_end));
	}

	get_timeline_item(item) {
		// item can have content*, creation*,
		// timeline_badge, icon, icon_size,
		// hide_timestamp, is_card
		const timeline_item = $(`<div class="timeline-item">`);
		timeline_item.attr({
			"data-doctype": item.doctype,
			"data-name": item.name,
		});
		if (item.icon) {
			timeline_item.append(`
				<div class="timeline-badge" title='${item.title || frappe.utils.to_title_case(item.icon)}'>
					${frappe.utils.icon(item.icon, item.icon_size || 'md')}
				</div>
			`);
		} else if (item.timeline_badge) {
			timeline_item.append(item.timeline_badge);
		} else {
			timeline_item.append(`<div class="timeline-dot">`);
		}

		timeline_item.append(`<div class="timeline-content ${item.is_card ? 'frappe-card' : ''}">`);
		timeline_item.find('.timeline-content').append(item.content);
		if (!item.hide_timestamp && !item.is_card) {
			timeline_item.find('.timeline-content').append(`<span> - ${comment_when(item.creation)}</span>`);
		}
		return timeline_item;
	}
}

export default BaseTimeline;